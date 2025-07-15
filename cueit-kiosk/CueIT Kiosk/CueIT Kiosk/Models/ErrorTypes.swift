import Foundation

// MARK: - Connection Error Types
enum ConnectionError: LocalizedError {
    case invalidURL
    case serverUnreachable
    case unauthorized
    case timeout
    case networkUnavailable
    case invalidResponse
    case serverError(String)
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid server URL"
        case .serverUnreachable:
            return "Server is not reachable"
        case .unauthorized:
            return "Authentication failed"
        case .timeout:
            return "Connection timeout"
        case .networkUnavailable:
            return "Network is unavailable"
        case .invalidResponse:
            return "Invalid server response"
        case .serverError(let message):
            return "Server error: \(message)"
        case .unknown(let message):
            return "Unknown error: \(message)"
        }
    }
}

// MARK: - Activation State
enum ActivationState: String, CaseIterable {
    case needsServerConfig = "needs_server_config"
    case waitingForActivation = "waiting_for_activation"
    case active = "active"
    case error = "error"
    case checking = "checking"
    case inactive = "inactive"
    
    var displayName: String {
        switch self {
        case .needsServerConfig:
            return "Server Configuration Required"
        case .waitingForActivation:
            return "Waiting for Activation"
        case .active:
            return "Active"
        case .error:
            return "Error"
        case .checking:
            return "Checking Status"
        case .inactive:
            return "Inactive"
        }
    }
}
