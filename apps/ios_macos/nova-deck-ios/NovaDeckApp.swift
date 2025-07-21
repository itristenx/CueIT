import SwiftUI

@main
struct NovaDeckApp: App {
    @StateObject private var appModel = NovaDeckAppModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appModel)
                .preferredColorScheme(.light)
        }
    }
}
