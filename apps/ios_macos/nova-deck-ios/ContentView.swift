import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    
    var body: some View {
        if !appModel.isAuthenticated {
            AuthenticationView()
                .environmentObject(appModel)
        } else {
            TabView {
                DashboardView()
                    .tabItem {
                        Image(systemName: "house.fill")
                        Text("Dashboard")
                    }
                    .environmentObject(appModel)
                
                ModulesView()
                    .tabItem {
                        Image(systemName: "square.grid.3x3")
                        Text("Modules")
                    }
                    .environmentObject(appModel)
                
                QuickActionsView()
                    .tabItem {
                        Image(systemName: "bolt.circle.fill")
                        Text("Quick Actions")
                    }
                    .environmentObject(appModel)
                
                ProfileView()
                    .tabItem {
                        Image(systemName: "person.circle.fill")
                        Text("Profile")
                    }
                    .environmentObject(appModel)
            }
            .accentColor(.blue)
        }
    }
}

// MARK: - Authentication View

struct AuthenticationView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Nova Logo and Title
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("Nova Deck")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Universe Launcher")
                    .font(.title2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Login Form
            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button("Sign In") {
                    appModel.signIn(email: email, password: password)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(appModel.isLoading)
                
                if let errorMessage = appModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
            .padding(.horizontal, 40)
            
            Spacer()
        }
        .overlay(
            Group {
                if appModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.3))
                }
            }
        )
    }
}

// MARK: - Dashboard View

struct DashboardView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome Header
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Welcome back!")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Text(appModel.currentUser?.name ?? "User")
                                    .font(.title)
                                    .fontWeight(.bold)
                            }
                            
                            Spacer()
                            
                            Button("Sign Out") {
                                appModel.signOut()
                            }
                            .foregroundColor(.red)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(radius: 2)
                    }
                    
                    // Quick Stats
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 16) {
                        StatCard(title: "Online Modules", value: "\(appModel.moduleStatuses.filter(\.isOnline).count)", color: .green)
                        StatCard(title: "Notifications", value: "\(appModel.moduleStatuses.map(\.notifications).reduce(0, +))", color: .orange)
                        StatCard(title: "Your Role", value: appModel.currentUser?.role.displayName ?? "Unknown", color: .blue)
                        StatCard(title: "Last Updated", value: "Now", color: .purple)
                    }
                    
                    // Recent Activity (Mock)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Activity")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        LazyVStack(spacing: 8) {
                            ActivityItem(icon: "doc.text", title: "New ticket created", time: "2 min ago", color: .blue)
                            ActivityItem(icon: "checkmark.circle", title: "Ticket resolved", time: "15 min ago", color: .green)
                            ActivityItem(icon: "person.badge.plus", title: "New user registered", time: "1 hour ago", color: .orange)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .refreshable {
                // Refresh data
            }
        }
    }
}

// MARK: - Modules View

struct ModulesView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    
    let columns = Array(repeating: GridItem(.flexible(), spacing: 16), count: 2)
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(appModel.moduleStatuses, id: \.module.id) { status in
                        ModuleCard(moduleStatus: status)
                            .environmentObject(appModel)
                    }
                }
                .padding()
            }
            .navigationTitle("Nova Universe")
            .refreshable {
                // Refresh module statuses
            }
        }
    }
}

// MARK: - Quick Actions View

struct QuickActionsView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    @State private var showingTicketForm = false
    @State private var cosmoQuestion = ""
    @State private var cosmoResponse = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Quick Ticket
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Quick Actions")
                            .font(.headline)
                        
                        Button("Submit New Ticket") {
                            showingTicketForm = true
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    
                    // Ask Cosmo
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Ask Cosmo AI")
                            .font(.headline)
                        
                        TextField("Ask a question...", text: $cosmoQuestion)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        
                        Button("Ask Cosmo") {
                            appModel.askCosmo(question: cosmoQuestion) { response in
                                cosmoResponse = response
                                cosmoQuestion = ""
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.purple)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .disabled(cosmoQuestion.isEmpty)
                        
                        if !cosmoResponse.isEmpty {
                            Text(cosmoResponse)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Quick Actions")
        }
        .sheet(isPresented: $showingTicketForm) {
            QuickTicketForm()
                .environmentObject(appModel)
        }
    }
}

// MARK: - Profile View

struct ProfileView: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        VStack(alignment: .leading) {
                            Text(appModel.currentUser?.name ?? "Unknown User")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Text(appModel.currentUser?.email ?? "No email")
                                .foregroundColor(.secondary)
                            
                            Text(appModel.currentUser?.role.displayName ?? "No role")
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.blue.opacity(0.2))
                                .cornerRadius(8)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                
                Section("Permissions") {
                    ForEach(appModel.currentUser?.permissions ?? [], id: \.self) { permission in
                        Text(permission)
                    }
                }
                
                Section("Actions") {
                    Button("Sign Out") {
                        appModel.signOut()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Profile")
        }
    }
}
                KioskManagementView()
            case .users:
                UsersView()
            case .analytics:
                AnalyticsView()
            case .notifications:
                NotificationsView()
            case .integrations:
                IntegrationsView()
            case .settings:
                SettingsView()
            case .services:
                ServicesView()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(NSColor.controlBackgroundColor))
    }
}

struct DashboardView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Dashboard")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 16) {
                ServiceStatusCard(title: "API Server", 
                                status: appModel.services.first(where: { $0.name == "CueIT API" })?.isRunning ?? false,
                                url: "http://localhost:3000")
                
                ServiceStatusCard(title: "Admin UI", 
                                status: appModel.services.first(where: { $0.name == "CueIT Admin" })?.isRunning ?? false,
                                url: "http://localhost:5175")
                
                ServiceStatusCard(title: "Slack Bot", 
                                status: appModel.services.first(where: { $0.name == "CueIT Slack" })?.isRunning ?? false,
                                url: "http://localhost:3001")
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Quick Actions")
                    .font(.headline)
                
                HStack(spacing: 12) {
                    Button("Start Services") {
                        appModel.startServices()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button("Stop Services") {
                        appModel.stopServices()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Open Admin UI") {
                        appModel.openAdminUI()
                    }
                    .buttonStyle(.bordered)
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

struct ServiceStatusCard: View {
    let title: String
    let status: Bool
    let url: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Circle()
                    .fill(status ? Color.green : Color.red)
                    .frame(width: 12, height: 12)
            }
            
            Text(status ? "Running" : "Stopped")
                .font(.caption)
                .foregroundColor(.secondary)
            
            if status {
                Button("Open") {
                    if let url = URL(string: url) {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.borderless)
                .font(.caption)
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

// Placeholder views for other sections
struct TicketsView: View {
    var body: some View {
        VStack {
            Text("Tickets Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("View and manage support tickets from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/tickets") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct KiosksView: View {
    var body: some View {
        VStack {
            Text("Kiosk Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Monitor and manage your deployed kiosks from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/kiosks") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct KioskManagementView: View {
    var body: some View {
        VStack {
            Text("Kiosk Activation")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Generate QR codes and manage kiosk activations from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/kiosk-activation") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct UsersView: View {
    var body: some View {
        VStack {
            Text("User Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Manage users and permissions from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/users") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct AnalyticsView: View {
    var body: some View {
        VStack {
            Text("Analytics")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("View analytics and reports from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/analytics") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct NotificationsView: View {
    var body: some View {
        VStack {
            Text("Notifications")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Manage notifications from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/notifications") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct IntegrationsView: View {
    var body: some View {
        VStack {
            Text("Integrations")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Configure integrations from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/integrations") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct SettingsView: View {
    var body: some View {
        VStack {
            Text("Settings")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Configure system settings from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/settings") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(CueITAppModel())
    }
}
