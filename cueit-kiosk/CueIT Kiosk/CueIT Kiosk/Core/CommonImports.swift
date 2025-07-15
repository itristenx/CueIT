// 
//  CommonImports.swift
//  CueIT Kiosk
//
//  Common imports and explicit type definitions to work around VS Code Swift language server issues
//

import Foundation
import SwiftUI
import Combine

// MARK: - Explicit forward declarations for VS Code compatibility

// Define the types that VS Code can't seem to find
public typealias AppConnectionStatus = ConnectionStatus
public typealias AppServerConfiguration = ServerConfiguration  
public typealias AppKioskConfiguration = KioskConfiguration
public typealias AppKioskInfo = KioskInfo
public typealias AppDirectoryUser = DirectoryUser
public typealias AppActivationState = ActivationState
public typealias AppConnectionError = ConnectionError
public typealias AppNotificationAction = NotificationAction
public typealias AppOfficeHoursConfig = OfficeHoursConfig
public typealias AppWeeklySchedule = WeeklySchedule
public typealias AppDaySchedule = DaySchedule
public typealias AppTimeSlot = TimeSlot
public typealias AppQueuedTicket = QueuedTicket

// MARK: - Service type aliases for better VS Code support
public typealias AppAPIConfig = APIConfig
public typealias AppKeychainService = KeychainService
public typealias AppTicketQueue = TicketQueue
public typealias AppTheme = Theme

// MARK: - Explicit service references
extension APIConfig {
    static var shared: APIConfig.Type { APIConfig.self }
}

extension KeychainService {
    static var shared: KeychainService.Type { KeychainService.self }
}

extension TicketQueue {
    static var instance: TicketQueue { TicketQueue.shared }
}

// MARK: - Theme re-export for VS Code compatibility  
extension Theme {
    static var shared: Theme.Type { Theme.self }
}
