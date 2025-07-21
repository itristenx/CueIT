import SwiftUI
import AppKit

@main
struct NovaDeckApp: App {
    @StateObject private var appModel = NovaDeckAppModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appModel)
                .frame(minWidth: 1000, minHeight: 700)
        }
        .windowStyle(DefaultWindowStyle())
        .commands {
            SidebarCommands()
        }
    }
}
