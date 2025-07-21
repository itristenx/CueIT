//
//  ErrorHandler.swift
//  Nova Beacon Kiosk
//
//  Comprehensive error handling and recovery for kiosk operations
//

import Foundation
import SwiftUI

@MainActor
class ErrorHandler: ObservableObject {
    static let shared = ErrorHandler()
    
    @Published var currentError: KioskError?
    @Published var isShowingError = false
    @Published var errorHistory: [KioskError] = []
    
    private let maxErrorHistory = 50
    
    private init() {
        setupErrorObservers()
    }
    
    // MARK: - Error Handling
    func handleError(_ error: Error, context: String = "") {
        let kioskError = KioskError.from(error, context: context)
        
        currentError = kioskError
        isShowingError = true
        
        // Add to history
        errorHistory.insert(kioskError, at: 0)
        if errorHistory.count > maxErrorHistory {
            errorHistory.removeLast()
        }
        
        // Log error
        logError(kioskError)
        
        // Handle specific error types
        handleSpecificError(kioskError)
    }
    
    func clearError() {
        currentError = nil
        isShowingError = false
    }
    
    // MARK: - Private Methods
    private func setupErrorObservers() {
        NotificationCenter.default.addObserver(
            forName: .kioskAPIError,
            object: nil,
            queue: .main
        ) { notification in
            if let error = notification.userInfo?["error"] as? Error,
               let context = notification.userInfo?["context"] as? String {
                self.handleError(error, context: context)
            }
        }
    }
    
    private func handleSpecificError(_ error: KioskError) {
        switch error.type {
        case .networkError:
            // Auto-retry for network errors
            scheduleRetry(after: 5.0)
        case .authenticationError:
            // Navigate to activation flow
            notifyAuthenticationRequired()
        case .configurationError:
            // Attempt to refresh configuration
            Task {
                await ConfigurationManager.shared.refreshConfiguration()
            }
        case .serverError:
            // Check server status
            Task {
                _ = await ConfigurationManager.shared.checkServerStatus()
            }
        case .unknown:
            // Generic error handling
            break
        }
    }
    
    private func scheduleRetry(after delay: TimeInterval) {
        Task {
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            // Retry last operation (this would need to be implemented based on context)
        }
    }
    
    private func notifyAuthenticationRequired() {
        NotificationCenter.default.post(name: .authenticationRequired, object: nil)
    }
    
    private func logError(_ error: KioskError) {
        print("🚨 Kiosk Error: \(error.title)")
        print("   Context: \(error.context)")
        print("   Description: \(error.description)")
        print("   Timestamp: \(error.timestamp)")
    }
}

// MARK: - Error Model
struct KioskError: Identifiable, Codable {
    let id = UUID()
    let title: String
    let description: String
    let type: ErrorType
    let context: String
    let timestamp: Date
    let recoverable: Bool
    
    enum ErrorType: String, Codable, CaseIterable {
        case networkError = "network"
        case authenticationError = "authentication"
        case configurationError = "configuration"
        case serverError = "server"
        case unknown = "unknown"
    }
    
    static func from(_ error: Error, context: String) -> KioskError {
        let type: ErrorType
        let title: String
        let description: String
        let recoverable: Bool
        
        if let urlError = error as? URLError {
            type = .networkError
            title = "Network Error"
            description = urlError.localizedDescription
            recoverable = true
        } else if error.localizedDescription.contains("401") || error.localizedDescription.contains("unauthorized") {
            type = .authenticationError
            title = "Authentication Error"
            description = "Kiosk authentication has expired"
            recoverable = true
        } else if error.localizedDescription.contains("404") {
            type = .configurationError
            title = "Configuration Error"
            description = "Kiosk configuration not found"
            recoverable = true
        } else if error.localizedDescription.contains("500") {
            type = .serverError
            title = "Server Error"
            description = "Internal server error occurred"
            recoverable = false
        } else {
            type = .unknown
            title = "Unknown Error"
            description = error.localizedDescription
            recoverable = false
        }
        
        return KioskError(
            title: title,
            description: description,
            type: type,
            context: context,
            timestamp: Date(),
            recoverable: recoverable
        )
    }
}

// MARK: - Additional Notification Names
extension Notification.Name {
    static let authenticationRequired = Notification.Name("authenticationRequired")
}
