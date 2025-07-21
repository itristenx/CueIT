# Nova Deck iOS

Nova Deck iOS is a native iOS application that serves as the primary launcher and management interface for the Nova Universe ecosystem. Built with SwiftUI, it provides a comprehensive dashboard for accessing all Nova modules and managing user interactions.

## Features

### Core Functionality
- **Unified Dashboard**: Central hub for all Nova Universe modules
- **Module Management**: Browse, launch, and manage individual Nova modules
- **Quick Actions**: Fast access to common tasks and workflows
- **Real-time Status**: Live health monitoring of all Nova services
- **User Authentication**: Secure login and session management

### Modules Integration
Nova Deck provides native access to:
- **Nova Synth**: Backend API services and data management
- **Nova Core**: Core application logic and shared services
- **Nova Orbit**: Project and workflow management
- **Nova Pulse**: Real-time communications and notifications
- **Nova Lore**: Knowledge base and documentation
- **Nova Admin**: Administrative tools and user management
- **Nova Beacon**: Kiosk mode and display management
- **Nova Comms**: Communication services and integrations

### User Interface
- **Tab-based Navigation**: Intuitive interface with Dashboard, Modules, Quick Actions, and Profile tabs
- **Responsive Design**: Optimized for iPhone and iPad
- **Dark/Light Mode**: Automatic theme support
- **Accessibility**: Full VoiceOver and accessibility support

## Technical Details

### Architecture
- **SwiftUI**: Modern declarative UI framework
- **Combine**: Reactive programming for data flow
- **URLSession**: HTTP client for API communication
- **UserDefaults**: Local storage for user preferences
- **Keychain**: Secure storage for authentication tokens

### API Integration
- REST API communication with Nova Synth backend
- JWT token-based authentication
- Real-time health monitoring endpoints
- Module-specific API integrations

### File Structure
```
nova-deck-ios/
├── NovaDeckApp.swift          # App entry point
├── NovaDeckAppModel.swift     # Core app state and logic
├── ContentView.swift          # Main UI structure
├── NovaUIComponents.swift     # Reusable UI components
└── README.md                  # This documentation
```

## Getting Started

### Prerequisites
- Xcode 15.0 or later
- iOS 17.0 or later target
- Nova Universe backend services running

### Installation
1. Open the project in Xcode
2. Configure your team signing certificate
3. Update the API base URL in `NovaDeckAppModel.swift` if needed
4. Build and run on device or simulator

### Configuration
The app automatically detects available Nova services. Configure the backend URL in the app model:

```swift
private let baseURL = "http://localhost:3000" // Update as needed
```

## Usage

### Dashboard
The dashboard provides an overview of:
- System health status
- Active module count
- Recent activity
- Quick access to critical functions

### Modules View
Browse all available Nova modules with:
- Real-time online/offline status
- Module descriptions and capabilities
- Direct launch capabilities
- Notification badges

### Quick Actions
Fast access to common tasks:
- Create new projects
- Submit support tickets
- View system status
- Access recent items

### Profile
User account management:
- View profile information
- Manage preferences
- Security settings
- App information

## Development

### Adding New Modules
To add support for a new Nova module:

1. Add the module to the `NovaModule` enum
2. Update the module descriptions and icons
3. Implement the launch URL in `openModule()`
4. Add role-based access control if needed

### Customization
- Module icons: Update the `icon` property in `NovaModule`
- Module descriptions: Modify the `description` property
- Colors: Extend the `Color` extension in `NovaUIComponents.swift`
- Quick actions: Add new actions to the `quickActions` array

## Security

### Authentication
- Secure token storage in iOS Keychain
- Automatic token refresh
- Session timeout handling
- Secure API communication over HTTPS

### Permissions
- Role-based access control integration
- Module-level permissions
- Administrative function restrictions

## Support

For technical support or feature requests, please:
1. Submit a ticket through the Nova Admin module
2. Contact the development team
3. Review the Nova Lore knowledge base

## License

This project is part of the Nova Universe ecosystem. See the main project LICENSE file for details.
