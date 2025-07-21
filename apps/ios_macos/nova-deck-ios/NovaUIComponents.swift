import SwiftUI

// MARK: - Supporting UI Components

struct ModuleCard: View {
    let moduleStatus: ModuleStatus
    @EnvironmentObject var appModel: NovaDeckAppModel
    
    var body: some View {
        Button {
            appModel.openModule(moduleStatus.module)
        } label: {
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: moduleStatus.module.icon)
                        .font(.title)
                        .foregroundColor(.blue)
                    
                    Spacer()
                    
                    Circle()
                        .fill(moduleStatus.isOnline ? Color.green : Color.red)
                        .frame(width: 12, height: 12)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(moduleStatus.module.rawValue)
                        .font(.headline)
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.leading)
                    
                    Text(moduleStatus.module.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                if moduleStatus.notifications > 0 {
                    HStack {
                        Spacer()
                        Text("\(moduleStatus.notifications)")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 2)
        }
        .buttonStyle(PlainButtonStyle())
        .opacity(appModel.canAccessModule(moduleStatus.module) ? 1.0 : 0.6)
        .disabled(!appModel.canAccessModule(moduleStatus.module))
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct ActivityItem: View {
    let icon: String
    let title: String
    let time: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                
                Text(time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(radius: 1)
    }
}

struct QuickTicketForm: View {
    @EnvironmentObject var appModel: NovaDeckAppModel
    @Environment(\.presentationMode) var presentationMode
    
    @State private var title = ""
    @State private var description = ""
    @State private var priority = "Normal"
    
    let priorities = ["Low", "Normal", "High", "Critical"]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Ticket Details") {
                    TextField("Title", text: $title)
                    
                    Picker("Priority", selection: $priority) {
                        ForEach(priorities, id: \.self) { priority in
                            Text(priority).tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(5...10)
                }
                
                Section {
                    Button("Submit Ticket") {
                        appModel.submitQuickTicket(title: title, description: description)
                        presentationMode.wrappedValue.dismiss()
                    }
                    .disabled(title.isEmpty || description.isEmpty)
                }
            }
            .navigationTitle("New Ticket")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Extensions

extension Color {
    static let novaBlue = Color.blue
    static let novaGreen = Color.green
    static let novaOrange = Color.orange
    static let novaPurple = Color.purple
}
