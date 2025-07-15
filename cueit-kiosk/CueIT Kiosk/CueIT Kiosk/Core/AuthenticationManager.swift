//
//  AuthenticationManager.swift
//  CueIT Kiosk
//
//  Manages admin authentication and permissions
//

import SwiftUI
import Combine
import LocalAuthentication

// MARK: - Authentication Types
enum AuthMethod {
    case pin
    case biometric
}

enum BiometricType {
    case none
    case touchID
    case faceID
}

enum AdminPermission {
    case configureSettings
    case manageUsers
    case viewLogs
    case systemControl
}

struct AdminSession {
    let id = UUID()
    let startTime = Date()
    var lastActivity = Date()
    let permissions: [AdminPermission] = [.configureSettings, .manageUsers, .viewLogs, .systemControl]
    
    mutating func extendSession() {
        lastActivity = Date()
    }
    
    var isExpired: Bool {
        Date().timeIntervalSince(lastActivity) > 900 // 15 minutes
    }
}

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    // MARK: - Published Properties
    @Published var isAdminAuthenticated = false
    @Published var currentAdminSession: AdminSession?
    @Published var authenticationMethod: AuthMethod = .pin
    @Published var biometricType: BiometricType = .none
    
    // MARK: - Private Properties
    private var sessionTimer: Timer?
    private let sessionTimeout: TimeInterval = 900 // 15 minutes
    
    private init() {
        checkBiometricAvailability()
    }
    
    // MARK: - Admin Authentication
    func authenticateAdmin(with credential: String) async -> Bool {
        let success = await validateCredential(credential)
        
        if success {
            startAdminSession()
        }
        
        return success
    }
    
    func authenticateWithBiometrics() async -> Bool {
        guard biometricType != .none else { return false }
        
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return false
        }
        
        do {
            let reason = "Authenticate to access kiosk admin settings"
            let success = try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason)
            
            if success {
                startAdminSession()
            }
            
            return success
        } catch {
            print("Biometric authentication failed: \(error)")
            return false
        }
    }
    
    func logout() {
        isAdminAuthenticated = false
        currentAdminSession = nil
        sessionTimer?.invalidate()
        sessionTimer = nil
    }
    
    func extendSession() {
        guard isAdminAuthenticated else { return }
        
        currentAdminSession?.extendSession()
        setupSessionTimer()
    }
    
    // MARK: - PIN Management
    func setAdminPIN(_ pin: String) -> Bool {
        let hashedPIN = hashPIN(pin)
        KeychainService.set(hashedPIN, for: "admin_pin")
        return true
    }
    
    func hasAdminPINSet() -> Bool {
        return KeychainService.string(for: "admin_pin") != nil
    }
    
    func changeAdminPIN(currentPIN: String, newPIN: String) async -> Bool {
        let isCurrentValid = await validateCredential(currentPIN)
        guard isCurrentValid else { return false }
        
        return setAdminPIN(newPIN)
    }
    
    // MARK: - Permissions
    func hasPermission(_ permission: AdminPermission) -> Bool {
        guard let session = currentAdminSession else { return false }
        return session.permissions.contains(permission)
    }
    
    func requestElevatedAccess(for permission: AdminPermission) async -> Bool {
        // For now, all authenticated admins have all permissions
        // This can be extended for role-based access control
        return isAdminAuthenticated
    }
    
    // MARK: - Private Methods
    private func validateCredential(_ credential: String) async -> Bool {
        // Check against stored PIN
        if let storedHash = KeychainService.string(for: "admin_pin") {
            let credentialHash = hashPIN(credential)
            return credentialHash == storedHash
        }
        
        // If no PIN is set, check against server admin authentication
        if let serverConfig = ConfigurationManager.shared.serverConfiguration {
            return await validateServerAdminCredential(credential, serverURL: serverConfig.baseURL)
        }
        
        // Default PIN for first-time setup
        return credential == "admin123"
    }
    
    private func validateServerAdminCredential(_ credential: String, serverURL: String) async -> Bool {
        // This would validate against the server's admin PIN endpoint
        // For now, return false to force local PIN usage
        return false
    }
    
    private func startAdminSession() {
        isAdminAuthenticated = true
        var session = AdminSession()
        currentAdminSession = session
        setupSessionTimer()
    }
    
    private func setupSessionTimer() {
        sessionTimer?.invalidate()
        sessionTimer = Timer.scheduledTimer(withTimeInterval: sessionTimeout, repeats: false) { _ in
            Task { @MainActor in
                self.logout()
            }
        }
    }
    
    private func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            switch context.biometryType {
            case .faceID:
                biometricType = .faceID
            case .touchID:
                biometricType = .touchID
            default:
                biometricType = .none
            }
        } else {
            biometricType = .none
        }
    }
    
    private func hashPIN(_ pin: String) -> String {
        // Simple hash for demo - in production, use proper password hashing
        return pin.data(using: .utf8)?.base64EncodedString() ?? ""
    }
}
