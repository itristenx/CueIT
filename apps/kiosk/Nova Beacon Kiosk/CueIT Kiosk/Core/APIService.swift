//
//  APIService.swift
//  CueIT Kiosk
//
//  Handles all API communication with the CueIT backend
//

import Foundation

class APIService {
    static let shared = APIService()
    
    private let session: URLSession
    private let timeout: TimeInterval = 30
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeout
        config.timeoutIntervalForResource = timeout * 2
        config.waitsForConnectivity = true
        
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Connection Testing
    func testConnection(serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/health") else { return false }
        
        do {
            let (data, response) = try await session.data(from: url)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                // Try to parse health response
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   json["status"] as? String == "ok" {
                    return true
                }
            }
        } catch {
            print("Connection test failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Kiosk Registration & Status
    func registerKiosk(id: String, version: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/register-kiosk") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = [
            "id": id,
            "version": version,
            "token": getKioskToken()
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Kiosk registration failed: \(error)")
        }
        
        return false
    }
    
    func checkKioskStatus(id: String, serverURL: String) async -> [String: Any]? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(id)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                return try JSONSerialization.jsonObject(with: data) as? [String: Any]
            }
        } catch {
            print("Kiosk status check failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Kiosk Management
    func activateKiosk(activationCode: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/activate") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["activationCode": activationCode]
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200,
               let responseData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let token = responseData["token"] as? String {
                
                // Store the kiosk token
                UserDefaults.standard.set(token, forKey: "kioskToken")
                return true
            }
        } catch {
            print("Activation error: \(error)")
        }
        
        return false
    }
    
    func getKioskConfiguration(serverURL: String) async -> KioskConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/configuration") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            return try JSONDecoder().decode(KioskConfiguration.self, from: data)
        } catch {
            print("Configuration fetch error: \(error)")
            return nil
        }
    }
    
    func checkKioskActivationStatus(serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/status") else { return false }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200,
               let responseData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let isActive = responseData["isActive"] as? Bool {
                return isActive
            }
        } catch {
            print("Status check error: \(error)")
        }
        
        return false
    }
    
    private func getKioskToken() -> String {
        return UserDefaults.standard.string(forKey: "kioskToken") ?? ""
    }
    
    // MARK: - Status Configuration
    func getStatusConfiguration(kioskId: String, serverURL: String) async -> StatusConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/status-config?kioskId=\(kioskId)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    return parseStatusConfiguration(from: json)
                }
            }
        } catch {
            print("Status configuration fetch failed: \(error)")
        }
        
        return nil
    }
    
    private func parseStatusConfiguration(from data: [String: Any]) -> StatusConfiguration {
        return StatusConfiguration(
            availableMessage: data["availableMessage"] as? String ?? "Ready to help",
            inUseMessage: data["inUseMessage"] as? String ?? "Room occupied",
            meetingMessage: data["meetingMessage"] as? String ?? "In a meeting",
            brbMessage: data["brbMessage"] as? String ?? "Will be back shortly",
            lunchMessage: data["lunchMessage"] as? String ?? "Out for lunch",
            unavailableMessage: data["unavailableMessage"] as? String ?? "Status unknown"
        )
    }
    
    func updateKioskStatus(kioskId: String, status: KioskStatus, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(kioskId)/status") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        let payload = [
            "status": status.rawValue,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Status update failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Activation (Legacy method - kept for compatibility)
    func activateKiosk(id: String, activationCode: String, serverURL: String) async -> Bool {
        return await activateKiosk(activationCode: activationCode, serverURL: serverURL)
    }
    
    // MARK: - Configuration (Legacy method - kept for compatibility)
    func getKioskConfiguration(id: String, serverURL: String) async -> [String: Any]? {
        if let config = await getKioskConfiguration(serverURL: serverURL) {
            return ["config": config]
        }
        return nil
    }
    
    // MARK: - Enhanced Configuration Management
    func refreshKioskConfiguration(serverURL: String) async -> KioskConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/configuration") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                return try decoder.decode(KioskConfiguration.self, from: data)
            }
        } catch {
            print("Configuration refresh failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Health Check & Status Validation
    func validateKioskToken(serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/validate-token") else { return false }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Token validation failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Enhanced Error Handling
    func handleAPIError(_ error: Error, context: String) {
        print("API Error in \(context): \(error.localizedDescription)")
        
        // Post notification for error handling
        NotificationCenter.default.post(
            name: .kioskAPIError,
            object: nil,
            userInfo: [
                "error": error,
                "context": context,
                "timestamp": Date()
            ]
        )
    }
    
    // MARK: - Ticket Submission
    func submitTicket(kioskId: String, category: String, description: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/submit-ticket") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        let payload = [
            "kioskId": kioskId,
            "category": category,
            "description": description,
            "priority": "medium",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            handleAPIError(error, context: "submitTicket")
        }
        
        return false
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let kioskAPIError = Notification.Name("kioskAPIError")
    static let kioskConfigurationUpdated = Notification.Name("kioskConfigurationUpdated")
    static let kioskStatusChanged = Notification.Name("kioskStatusChanged")
}