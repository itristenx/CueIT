//
//  Notification+Extensions.swift
//  CueIT Kiosk
//
//  Notification extensions for app-specific notifications
//

import Foundation

extension Notification.Name {
    static let connectionRetryRequested = Notification.Name("connectionRetryRequested")
    static let kioskActivationChanged = Notification.Name("kioskActivationChanged")
    static let configurationUpdated = Notification.Name("configurationUpdated")
    static let serverStatusChanged = Notification.Name("serverStatusChanged")
    static let adminSessionStarted = Notification.Name("adminSessionStarted")
    static let adminSessionEnded = Notification.Name("adminSessionEnded")
}
