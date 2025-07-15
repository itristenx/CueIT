import Foundation

// MARK: - Notification Action
struct NotificationAction {
    let title: String
    let action: () -> Void
    
    init(title: String, action: @escaping () -> Void) {
        self.title = title
        self.action = action
    }
}

// MARK: - Notification Manager
@MainActor
class NotificationManager: ObservableObject {
    static let shared = NotificationManager()
    
    @Published var currentNotification: NotificationData?
    @Published var isVisible = false
    
    private init() {}
    
    func showInfo(title: String, message: String, action: NotificationAction? = nil) {
        showNotification(type: .info, title: title, message: message, action: action)
    }
    
    func showSuccess(title: String, message: String, action: NotificationAction? = nil) {
        showNotification(type: .success, title: title, message: message, action: action)
    }
    
    func showError(title: String, message: String, action: NotificationAction? = nil) {
        showNotification(type: .error, title: title, message: message, action: action)
    }
    
    func showWarning(title: String, message: String, action: NotificationAction? = nil) {
        showNotification(type: .warning, title: title, message: message, action: action)
    }
    
    private func showNotification(type: NotificationType, title: String, message: String, action: NotificationAction?) {
        let notification = NotificationData(
            type: type,
            title: title,
            message: message,
            action: action
        )
        
        currentNotification = notification
        isVisible = true
        
        // Auto-dismiss after 5 seconds if no action
        if action == nil {
            Task {
                try? await Task.sleep(for: .seconds(5))
                if currentNotification?.id == notification.id {
                    dismiss()
                }
            }
        }
    }
    
    func dismiss() {
        isVisible = false
        currentNotification = nil
    }
}

// MARK: - Notification Data
struct NotificationData: Identifiable {
    let id = UUID()
    let type: NotificationType
    let title: String
    let message: String
    let action: NotificationAction?
}

// MARK: - Notification Type
enum NotificationType: String, CaseIterable {
    case info = "info"
    case success = "success"
    case error = "error"
    case warning = "warning"
    
    var iconName: String {
        switch self {
        case .info:
            return "info.circle.fill"
        case .success:
            return "checkmark.circle.fill"
        case .error:
            return "xmark.circle.fill"
        case .warning:
            return "exclamationmark.triangle.fill"
        }
    }
    
    var color: String {
        switch self {
        case .info:
            return "blue"
        case .success:
            return "green"
        case .error:
            return "red"
        case .warning:
            return "orange"
        }
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let connectionRetryRequested = Notification.Name("connectionRetryRequested")
}
