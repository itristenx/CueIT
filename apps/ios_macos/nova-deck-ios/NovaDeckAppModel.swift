import SwiftUI
import Foundation
import Combine

// Nova Universe Modules
enum NovaModule: String, CaseIterable, Identifiable {
    case orbit = "Nova Orbit"
    case pulse = "Nova Pulse"  
    case core = "Nova Core"
    case lore = "Nova Lore"
    case beacon = "Nova Beacon"
    case comms = "Nova Comms"
    case cosmo = "Cosmo AI"
    case ascend = "Nova Ascend"
    
    var id: String { rawValue }
    
    var icon: String {
        switch self {
        case .orbit: return "globe"
        case .pulse: return "bolt.heart"
        case .core: return "gearshape.2"
        case .lore: return "book"
        case .beacon: return "ipad"
        case .comms: return "message"
        case .cosmo: return "brain"
        case .ascend: return "star"
        }
    }
    
    var description: String {
        switch self {
        case .orbit: return "End user portal for tickets"
        case .pulse: return "Technician workflow management"
        case .core: return "Admin configuration center"
        case .lore: return "Knowledge base & documentation"
        case .beacon: return "iPad kiosk application"
        case .comms: return "Slack integration & notifications"
        case .cosmo: return "AI assistant & automation"
        case .ascend: return "Gamification & XP system"
        }
    }
    
    var url: String {
        switch self {
        case .orbit: return "http://localhost:3000"
        case .pulse: return "http://localhost:3003"
        case .core: return "http://localhost:3002"
        case .lore: return "http://localhost:3005"
        case .beacon: return "nova-beacon://"
        case .comms: return "http://localhost:3001"
        case .cosmo: return "nova-cosmo://"
        case .ascend: return "http://localhost:3001/ascend"
        }
    }
    
    var requiredRoles: [String] {
        switch self {
        case .orbit: return ["end_user", "manager", "technician", "admin"]
        case .pulse: return ["technician", "tech_lead", "admin"]
        case .core: return ["admin", "tech_lead"]
        case .lore: return ["end_user", "technician", "admin"]
        case .beacon: return ["admin", "tech_lead"]
        case .comms: return ["technician", "admin"]
        case .cosmo: return ["end_user", "technician", "admin"]
        case .ascend: return ["end_user", "technician", "admin"]
        }
    }
}

struct ModuleStatus {
    let module: NovaModule
    let isOnline: Bool
    let notifications: Int
    let lastUpdated: Date
}

// User roles in Nova Universe
enum UserRole: String, CaseIterable {
    case endUser = "end_user"
    case manager = "manager"
    case technician = "technician"
    case techLead = "tech_lead"
    case admin = "admin"
    
    var displayName: String {
        switch self {
        case .endUser: return "End User"
        case .manager: return "Manager"
        case .technician: return "Technician"
        case .techLead: return "Tech Lead"
        case .admin: return "Administrator"
        }
    }
}

class NovaDeckAppModel: ObservableObject {
    @Published var selectedModule: NovaModule? = nil
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: NovaUser? = nil
    @Published var moduleStatuses: [ModuleStatus] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    
    private var cancellables = Set<AnyCancellable>()
    private let apiBaseURL = "http://localhost:3001/api/v2"
    
    init() {
        loadModuleStatuses()
        startStatusMonitoring()
        checkAuthenticationStatus()
    }
    
    // MARK: - Authentication
    
    func checkAuthenticationStatus() {
        // Check if user is authenticated with Nova ID
        // This would integrate with Nova Helix authentication
        isLoading = true
        
        // Mock authentication check - replace with actual Nova ID integration
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.isAuthenticated = false // Set to true when user is logged in
            self.isLoading = false
        }
    }
    
    func signIn(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        // Integrate with Nova Helix authentication
        // For now, mock the authentication
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.isAuthenticated = true
            self.currentUser = NovaUser(
                id: "user-123",
                email: email,
                name: "Test User",
                role: .admin,
                permissions: ["access_all_modules"]
            )
            self.isLoading = false
        }
    }
    
    func signOut() {
        isAuthenticated = false
        currentUser = nil
        selectedModule = nil
    }
    
    // MARK: - Module Management
    
    private func loadModuleStatuses() {
        moduleStatuses = NovaModule.allCases.map { module in
            ModuleStatus(
                module: module,
                isOnline: Bool.random(), // Replace with actual health checks
                notifications: Int.random(in: 0...10),
                lastUpdated: Date()
            )
        }
    }
    
    private func startStatusMonitoring() {
        Timer.publish(every: 30.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.updateModuleStatuses()
            }
            .store(in: &cancellables)
    }
    
    private func updateModuleStatuses() {
        // Check health of each Nova module
        for (index, status) in moduleStatuses.enumerated() {
            checkModuleHealth(status.module) { isOnline in
                DispatchQueue.main.async {
                    self.moduleStatuses[index] = ModuleStatus(
                        module: status.module,
                        isOnline: isOnline,
                        notifications: status.notifications,
                        lastUpdated: Date()
                    )
                }
            }
        }
    }
    
    private func checkModuleHealth(_ module: NovaModule, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: module.url) else {
            completion(false)
            return
        }
        
        URLSession.shared.dataTask(with: url) { _, response, _ in
            let isOnline = (response as? HTTPURLResponse)?.statusCode == 200
            completion(isOnline)
        }.resume()
    }
    
    // MARK: - Module Access
    
    func canAccessModule(_ module: NovaModule) -> Bool {
        guard let user = currentUser else { return false }
        
        return module.requiredRoles.contains(user.role.rawValue) ||
               user.permissions.contains("access_all_modules")
    }
    
    func openModule(_ module: NovaModule) {
        guard canAccessModule(module) else {
            errorMessage = "You don't have permission to access \(module.rawValue)"
            return
        }
        
        selectedModule = module
        
        // Open module URL
        if let url = URL(string: module.url) {
            #if canImport(UIKit)
            UIApplication.shared.open(url)
            #elseif canImport(AppKit)
            NSWorkspace.shared.open(url)
            #endif
        }
    }
    
    // MARK: - Quick Actions
    
    func submitQuickTicket(title: String, description: String) {
        // Submit ticket via Nova Synth API
        isLoading = true
        
        // Mock API call - replace with actual API integration
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.isLoading = false
            // Show success message
        }
    }
    
    func askCosmo(question: String, completion: @escaping (String) -> Void) {
        // Query Cosmo AI assistant
        // Integrate with Nova Synth MCP endpoints
        
        // Mock response - replace with actual AI integration
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            completion("This is a mock response from Cosmo AI. The actual implementation would integrate with the Nova MCP server.")
        }
    }
}

// MARK: - Data Models

struct NovaUser {
    let id: String
    let email: String
    let name: String
    let role: UserRole
    let permissions: [String]
}
    
    private func checkServiceStatus() {
        for (index, service) in services.enumerated() {
            checkPortStatus(port: service.port) { [weak self] isRunning in
                DispatchQueue.main.async {
                    self?.services[index] = ServiceStatus(
                        name: service.name,
                        port: service.port,
                        isRunning: isRunning,
                        url: service.url
                    )
                }
            }
        }
    }
    
    private func checkPortStatus(port: Int, completion: @escaping (Bool) -> Void) {
        let task = Process()
        task.launchPath = "/usr/bin/lsof"
        task.arguments = ["-i", ":\(port)", "-t"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe
        
        task.terminationHandler = { _ in
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            completion(!output.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        
        try? task.run()
    }
    
    func startServices() {
        let selectedServices = [
            startAPI ? "api" : nil,
            startAdmin ? "admin" : nil,
            startSlack ? "slack" : nil
        ].compactMap { $0 }
        
        for service in selectedServices {
            startService(service)
        }
    }
    
    private func startService(_ service: String) {
        let serviceMap = [
            "synth": ("apps/nova-synth", "npm run start:dev"),
            "orbit": ("apps/nova-orbit", "npm run dev"),
            "core": ("apps/nova-core", "npm run dev"),
            "comms": ("apps/nova-comms", "npm start")
        ]
        
        guard let (directory, command) = serviceMap[service] else { return }
        
        let task = Process()
        task.launchPath = "/bin/bash"
        task.arguments = ["-c", "cd \(directory) && \(command)"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe
        
        pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            if let output = String(data: data, encoding: .utf8) {
                DispatchQueue.main.async {
                    self?.logs += "[\(service.uppercased())] \(output)"
                }
            }
        }
        
        do {
            try task.run()
            processes[service] = task
            DispatchQueue.main.async {
                self.logs += "Started \(service) service\n"
            }
        } catch {
            DispatchQueue.main.async {
                self.logs += "Failed to start \(service): \(error)\n"
            }
        }
    }
    
    func stopServices() {
        for (service, process) in processes {
            process.terminate()
            DispatchQueue.main.async {
                self.logs += "Stopped \(service) service\n"
            }
        }
        processes.removeAll()
    }
    
    func openAdminUI() {
        if let url = URL(string: "http://localhost:5175") {
            NSWorkspace.shared.open(url)
        }
    }
    
    func openAPIDocumentation() {
        if let url = URL(string: "http://localhost:3000/api/v1") {
            NSWorkspace.shared.open(url)
        }
    }
    
    func clearLogs() {
        logs = ""
    }
    
    func completeSetup() {
        showSetup = false
    }
}
