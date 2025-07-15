//
//  KioskAPI.swift
//  QueueIT Kiosk
//
//  API service for kiosk configuration and communication
//

import Foundation
import Combine

class KioskAPI: ObservableObject {
    static let shared = KioskAPI()
    
    @Published var isConnected: Bool = false
    @Published var configuration: KioskConfig?
    @Published var lastError: APIError?
    
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    enum APIError: Error, LocalizedError {
        case invalidURL
        case noData
        case decodingError
        case networkError(Error)
        case serverError(Int)
        case unauthorized
        case notFound
        
        var errorDescription: String? {
            switch self {
            case .invalidURL:
                return "Invalid server URL"
            case .noData:
                return "No data received from server"
            case .decodingError:
                return "Failed to decode server response"
            case .networkError(let error):
                return "Network error: \(error.localizedDescription)"
            case .serverError(let code):
                return "Server error: \(code)"
            case .unauthorized:
                return "Unauthorized access"
            case .notFound:
                return "Resource not found"
            }
        }
    }
    
    private init() {
        setupDateFormatters()
    }
    
    private func setupDateFormatters() {
        encoder.dateEncodingStrategy = .iso8601
        decoder.dateDecodingStrategy = .iso8601
    }
    
    // MARK: - Configuration Management
    
    func fetchConfiguration() async throws -> KioskConfig {
        let endpoint = "/api/kiosks/\(KioskService.shared.id)/config"
        let config: KioskConfig = try await performRequest(endpoint: endpoint, method: .GET)
        
        await MainActor.run {
            self.configuration = config
        }
        
        return config
    }
    
    func updateConfiguration(_ config: KioskConfig) async throws {
        let endpoint = "/api/kiosks/\(KioskService.shared.id)/config"
        let _: EmptyResponse = try await performRequest(
            endpoint: endpoint,
            method: .PUT,
            body: config
        )
        
        await MainActor.run {
            self.configuration = config
        }
    }
    
    // MARK: - Status Management
    
    func updateStatus(_ status: KioskStatus) async throws {
        let endpoint = "/api/kiosks/\(KioskService.shared.id)/status"
        let statusUpdate = KioskStatusUpdate(
            status: status,
            timestamp: Date(),
            kioskId: KioskService.shared.id
        )
        
        let _: EmptyResponse = try await performRequest(
            endpoint: endpoint,
            method: .POST,
            body: statusUpdate
        )
    }
    
    func fetchStatus() async throws -> KioskStatus {
        let endpoint = "/api/kiosks/\(KioskService.shared.id)/status"
        let response: KioskStatusResponse = try await performRequest(endpoint: endpoint, method: .GET)
        return response.status
    }
    
    // MARK: - Ticket Management
    
    func submitTicket(_ ticket: TicketSubmission) async throws -> TicketResponse {
        let endpoint = "/api/tickets"
        return try await performRequest(
            endpoint: endpoint,
            method: .POST,
            body: ticket
        )
    }
    
    // MARK: - Feedback Management
    
    func submitFeedback(_ feedback: FeedbackSubmission) async throws {
        let endpoint = "/api/feedback"
        let _: EmptyResponse = try await performRequest(
            endpoint: endpoint,
            method: .POST,
            body: feedback
        )
    }
    
    // MARK: - Kiosk Registration
    
    func registerKiosk(activationCode: String) async throws -> KioskRegistrationResponse {
        let endpoint = "/api/register-kiosk"
        let registration = KioskRegistration(
            id: KioskService.shared.id,
            activationCode: activationCode,
            deviceInfo: getDeviceInfo()
        )
        
        return try await performRequest(
            endpoint: endpoint,
            method: .POST,
            body: registration
        )
    }
    
    func checkActivationStatus() async throws -> ActivationStatusResponse {
        let endpoint = "/api/kiosks/\(KioskService.shared.id)/activation-status"
        return try await performRequest(endpoint: endpoint, method: .GET)
    }
    
    // MARK: - Server Info
    
    func fetchServerInfo() async throws -> ServerInfo {
        let endpoint = "/api/server-info"
        return try await performRequest(endpoint: endpoint, method: .GET)
    }
    
    // MARK: - Health Check
    
    func healthCheck() async throws -> HealthResponse {
        let endpoint = "/api/health"
        return try await performRequest(endpoint: endpoint, method: .GET)
    }
    
    // MARK: - Generic Request Handler
    
    private func performRequest<T: Codable, U: Codable>(
        endpoint: String,
        method: HTTPMethod,
        body: T? = nil
    ) async throws -> U {
        guard let url = URL(string: "\(APIConfig.baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authentication headers if available
        if let token = KeychainService.string(for: "auth_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add kiosk identification headers
        request.setValue(KioskService.shared.id, forHTTPHeaderField: "X-Kiosk-ID")
        request.setValue(getDeviceInfo().model, forHTTPHeaderField: "X-Device-Model")
        request.setValue(getDeviceInfo().version, forHTTPHeaderField: "X-App-Version")
        
        if let body = body {
            do {
                request.httpBody = try encoder.encode(body)
            } catch {
                throw APIError.networkError(error)
            }
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.networkError(URLError(.badServerResponse))
            }
            
            await MainActor.run {
                self.isConnected = true
                self.lastError = nil
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                if U.self == EmptyResponse.self {
                    return EmptyResponse() as! U
                }
                
                do {
                    return try decoder.decode(U.self, from: data)
                } catch {
                    throw APIError.decodingError
                }
            case 401:
                throw APIError.unauthorized
            case 404:
                throw APIError.notFound
            default:
                throw APIError.serverError(httpResponse.statusCode)
            }
        } catch {
            await MainActor.run {
                self.isConnected = false
                self.lastError = error as? APIError ?? APIError.networkError(error)
            }
            throw error
        }
    }
    
    // MARK: - Helper Methods
    
    private func getDeviceInfo() -> DeviceInfo {
        return DeviceInfo(
            model: UIDevice.current.model,
            version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0",
            systemVersion: UIDevice.current.systemVersion,
            identifier: UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        )
    }
}

// MARK: - Supporting Types

enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

struct EmptyResponse: Codable {
    init() {}
}

struct KioskStatusUpdate: Codable {
    let status: KioskStatus
    let timestamp: Date
    let kioskId: String
}

struct KioskStatusResponse: Codable {
    let status: KioskStatus
    let lastUpdated: Date
    let message: String?
}

struct TicketSubmission: Codable {
    let title: String
    let description: String
    let priority: String
    let category: String
    let submittedBy: String
    let kioskId: String
    let roomName: String
    let timestamp: Date
}

struct TicketResponse: Codable {
    let id: String
    let ticketNumber: String
    let status: String
    let estimatedResponse: String?
}

struct FeedbackSubmission: Codable {
    let kioskId: String
    let type: String
    let rating: Int
    let emoji: String?
    let roomName: String
    let timestamp: Date
    let comment: String?
}

struct KioskRegistration: Codable {
    let id: String
    let activationCode: String
    let deviceInfo: DeviceInfo
}

struct KioskRegistrationResponse: Codable {
    let success: Bool
    let message: String
    let configuration: KioskConfig?
}

struct ActivationStatusResponse: Codable {
    let isActive: Bool
    let status: String
    let lastSeen: Date?
    let configuration: KioskConfig?
}

struct ServerInfo: Codable {
    let version: String
    let organizationName: String
    let supportedFeatures: [String]
    let minAppVersion: String
    let maxAppVersion: String?
}

struct HealthResponse: Codable {
    let status: String
    let timestamp: Date
    let version: String
}

struct DeviceInfo: Codable {
    let model: String
    let version: String
    let systemVersion: String
    let identifier: String
}
