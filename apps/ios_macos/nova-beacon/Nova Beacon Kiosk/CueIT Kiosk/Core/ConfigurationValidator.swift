//
//  ConfigurationValidator.swift
//  CueIT Kiosk
//
//  Validates kiosk configuration and ensures all required settings are present
//

import Foundation

class ConfigurationValidator {
    static let shared = ConfigurationValidator()
    
    private init() {}
    
    // MARK: - Validation Results
    struct ValidationResult {
        let isValid: Bool
        let errors: [ValidationError]
        let warnings: [ValidationWarning]
    }
    
    struct ValidationError {
        let field: String
        let message: String
        let severity: Severity
        
        enum Severity {
            case critical
            case warning
            case info
        }
    }
    
    struct ValidationWarning {
        let field: String
        let message: String
        let recommendation: String
    }
    
    // MARK: - Configuration Validation
    func validateConfiguration(_ config: KioskConfiguration) -> ValidationResult {
        var errors: [ValidationError] = []
        var warnings: [ValidationWarning] = []
        
        // Validate required fields
        if config.id.isEmpty {
            errors.append(ValidationError(
                field: "id",
                message: "Kiosk ID is required",
                severity: .critical
            ))
        }
        
        if config.name.isEmpty {
            errors.append(ValidationError(
                field: "name",
                message: "Kiosk name is required",
                severity: .critical
            ))
        }
        
        if config.roomName.isEmpty {
            warnings.append(ValidationWarning(
                field: "roomName",
                message: "Room name is empty",
                recommendation: "Set a descriptive room name for better user experience"
            ))
        }
        
        // Validate mode
        if config.mode == .CUSTOM && config.ui.customSettings == nil {
            errors.append(ValidationError(
                field: "customSettings",
                message: "Custom mode requires custom settings",
                severity: .critical
            ))
        }
        
        // Validate security settings
        if config.security.adminPINRequired && config.security.adminPINMinLength < 4 {
            warnings.append(ValidationWarning(
                field: "adminPINMinLength",
                message: "Admin PIN minimum length is less than 4",
                recommendation: "Use at least 4 digits for better security"
            ))
        }
        
        // Validate UI settings
        if config.ui.theme.primaryColor.isEmpty {
            warnings.append(ValidationWarning(
                field: "primaryColor",
                message: "Primary color not set",
                recommendation: "Set a primary color for consistent branding"
            ))
        }
        
        // Validate refresh intervals
        if config.settings.refreshInterval < 30 {
            warnings.append(ValidationWarning(
                field: "refreshInterval",
                message: "Refresh interval is very short",
                recommendation: "Consider using at least 30 seconds to reduce server load"
            ))
        }
        
        let isValid = errors.filter { $0.severity == .critical }.isEmpty
        
        return ValidationResult(
            isValid: isValid,
            errors: errors,
            warnings: warnings
        )
    }
    
    // MARK: - Server Configuration Validation
    func validateServerConfiguration(_ config: ServerConfiguration) -> ValidationResult {
        var errors: [ValidationError] = []
        var warnings: [ValidationWarning] = []
        
        // Validate URL
        if config.baseURL.isEmpty {
            errors.append(ValidationError(
                field: "baseURL",
                message: "Server URL is required",
                severity: .critical
            ))
        } else if !isValidURL(config.baseURL) {
            errors.append(ValidationError(
                field: "baseURL",
                message: "Invalid server URL format",
                severity: .critical
            ))
        }
        
        // Validate name
        if config.name.isEmpty {
            warnings.append(ValidationWarning(
                field: "name",
                message: "Server name is empty",
                recommendation: "Set a descriptive server name"
            ))
        }
        
        // Check for HTTPS in production
        if !config.baseURL.hasPrefix("https://") && !config.baseURL.contains("localhost") {
            warnings.append(ValidationWarning(
                field: "baseURL",
                message: "Server URL is not using HTTPS",
                recommendation: "Use HTTPS for production environments"
            ))
        }
        
        let isValid = errors.filter { $0.severity == .critical }.isEmpty
        
        return ValidationResult(
            isValid: isValid,
            errors: errors,
            warnings: warnings
        )
    }
    
    // MARK: - Helper Methods
    private func isValidURL(_ urlString: String) -> Bool {
        guard let url = URL(string: urlString) else { return false }
        return url.scheme != nil && url.host != nil
    }
}

// MARK: - Configuration Extensions
extension KioskConfiguration {
    var isValid: Bool {
        return ConfigurationValidator.shared.validateConfiguration(self).isValid
    }
    
    var validationResult: ConfigurationValidator.ValidationResult {
        return ConfigurationValidator.shared.validateConfiguration(self)
    }
}

extension ServerConfiguration {
    var isValid: Bool {
        return ConfigurationValidator.shared.validateServerConfiguration(self).isValid
    }
    
    var validationResult: ConfigurationValidator.ValidationResult {
        return ConfigurationValidator.shared.validateServerConfiguration(self)
    }
}
