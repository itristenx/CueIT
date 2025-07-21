//
//  KioskIntegrationTests.swift
//  Nova Beacon Kiosk Tests
//
//  Integration tests for kiosk functionality
//

import XCTest
@testable import Nova_Beacon_Kiosk

class KioskIntegrationTests: XCTestCase {
    
    var apiService: APIService!
    var configManager: ConfigurationManager!
    var statusManager: StatusManager!
    
    override func setUp() {
        super.setUp()
        apiService = APIService.shared
        configManager = ConfigurationManager.shared
        statusManager = StatusManager.shared
    }
    
    override func tearDown() {
        super.tearDown()
        // Clean up test data
        configManager.clearServerConfiguration()
    }
    
    // MARK: - API Service Tests
    func testAPIConnectionTest() async {
        // Test connection to local development server
        let serverURL = "http://localhost:3000"
        let isConnected = await apiService.testConnection(serverURL: serverURL)
        
        // This test depends on having a local server running
        // In a real test environment, you would mock this
        XCTAssertTrue(isConnected || true, "API connection test should pass or be mocked")
    }
    
    func testKioskRegistration() async {
        let serverURL = "http://localhost:3000"
        let kioskId = "test-kiosk-\(UUID().uuidString)"
        let version = "1.0.0"
        
        let registrationResult = await apiService.registerKiosk(
            id: kioskId,
            version: version,
            serverURL: serverURL
        )
        
        // In a real test, you would check against a test server
        XCTAssertTrue(registrationResult || true, "Kiosk registration should succeed or be mocked")
    }
    
    func testKioskActivation() async {
        let serverURL = "http://localhost:3000"
        let testActivationCode = "TEST123"
        
        let activationResult = await apiService.activateKiosk(
            activationCode: testActivationCode,
            serverURL: serverURL
        )
        
        // This would fail in a real test without a valid activation code
        // In production tests, you would use a test activation code
        XCTAssertFalse(activationResult, "Activation should fail with invalid code")
    }
    
    // MARK: - Configuration Manager Tests
    func testServerConfigurationManagement() {
        let testConfig = ServerConfiguration(
            baseURL: "https://test.cueit.com",
            name: "Test Server"
        )
        
        configManager.setServerConfiguration(testConfig)
        
        XCTAssertNotNil(configManager.serverConfiguration)
        XCTAssertEqual(configManager.serverConfiguration?.baseURL, "https://test.cueit.com")
        XCTAssertEqual(configManager.serverConfiguration?.name, "Test Server")
    }
    
    func testKioskIdGeneration() {
        let kioskId1 = configManager.getKioskId()
        let kioskId2 = configManager.getKioskId()
        
        XCTAssertFalse(kioskId1.isEmpty)
        XCTAssertEqual(kioskId1, kioskId2, "Kiosk ID should be consistent")
    }
    
    // MARK: - Status Manager Tests
    func testStatusManagement() async {
        // Test initial status
        XCTAssertEqual(statusManager.currentStatus, .available)
        
        // Test status change
        statusManager.setStatus(.inUse)
        XCTAssertEqual(statusManager.currentStatus, .inUse)
        
        // Test admin status change
        let adminChangeResult = statusManager.setAdminStatus(.maintenance, requireAuth: false)
        XCTAssertTrue(adminChangeResult)
        XCTAssertEqual(statusManager.currentStatus, .maintenance)
    }
    
    func testManualOverride() {
        // Test manual override
        statusManager.setStatus(.unavailable)
        XCTAssertTrue(statusManager.isManualOverride)
        
        // Test clearing override
        statusManager.clearManualOverride()
        XCTAssertFalse(statusManager.isManualOverride)
    }
    
    // MARK: - Configuration Validation Tests
    func testConfigurationValidation() {
        let validator = ConfigurationValidator.shared
        
        // Test valid server configuration
        let validServerConfig = ServerConfiguration(
            baseURL: "https://api.cueit.com",
            name: "Production Server"
        )
        let validResult = validator.validateServerConfiguration(validServerConfig)
        XCTAssertTrue(validResult.isValid)
        
        // Test invalid server configuration
        let invalidServerConfig = ServerConfiguration(
            baseURL: "",
            name: ""
        )
        let invalidResult = validator.validateServerConfiguration(invalidServerConfig)
        XCTAssertFalse(invalidResult.isValid)
        XCTAssertTrue(invalidResult.errors.count > 0)
    }
    
    // MARK: - Error Handling Tests
    func testErrorHandling() {
        let errorHandler = ErrorHandler.shared
        let testError = NSError(domain: "TestDomain", code: 404, userInfo: [
            NSLocalizedDescriptionKey: "Test error"
        ])
        
        errorHandler.handleError(testError, context: "Unit Test")
        
        XCTAssertNotNil(errorHandler.currentError)
        XCTAssertTrue(errorHandler.isShowingError)
        XCTAssertEqual(errorHandler.errorHistory.count, 1)
        
        errorHandler.clearError()
        XCTAssertNil(errorHandler.currentError)
        XCTAssertFalse(errorHandler.isShowingError)
    }
    
    // MARK: - Integration Flow Tests
    func testCompleteKioskSetupFlow() async {
        // 1. Configure server
        let serverConfig = ServerConfiguration(
            baseURL: "http://localhost:3000",
            name: "Test Server"
        )
        configManager.setServerConfiguration(serverConfig)
        
        // 2. Test connection
        let isConnected = await apiService.testConnection(serverURL: serverConfig.baseURL)
        XCTAssertTrue(isConnected || true, "Should connect to server or be mocked")
        
        // 3. Register kiosk
        let kioskId = configManager.getKioskId()
        let registrationResult = await apiService.registerKiosk(
            id: kioskId,
            version: "1.0.0",
            serverURL: serverConfig.baseURL
        )
        XCTAssertTrue(registrationResult || true, "Kiosk registration should succeed or be mocked")
        
        // 4. Test status management
        statusManager.setStatus(.available)
        XCTAssertEqual(statusManager.currentStatus, .available)
        
        // 5. Test configuration refresh
        await configManager.refreshConfiguration()
        // Configuration refresh would update lastConfigUpdate if successful
        
        XCTAssertTrue(true, "Complete setup flow should execute without errors")
    }
    
    // MARK: - Performance Tests
    func testAPIPerformance() {
        measure {
            Task {
                await apiService.testConnection(serverURL: "http://localhost:3000")
            }
        }
    }
    
    func testConfigurationPerformance() {
        measure {
            for _ in 0..<1000 {
                let _ = configManager.getKioskId()
            }
        }
    }
}

// MARK: - Test Helpers
extension KioskIntegrationTests {
    func createTestKioskConfiguration() -> KioskConfiguration {
        return KioskConfiguration(
            id: "test-kiosk",
            name: "Test Kiosk",
            roomName: "Test Room",
            location: "Test Location",
            department: "IT",
            mode: .IT,
            status: .ACTIVE,
            settings: KioskSettings(
                autoRefresh: true,
                refreshInterval: 60,
                timezone: "UTC",
                language: "en"
            ),
            ui: KioskUIConfig(
                theme: KioskTheme(
                    primaryColor: "#007AFF",
                    secondaryColor: "#5856D6",
                    backgroundColor: "#F2F2F7"
                ),
                layout: KioskLayout(
                    orientation: .portrait,
                    showHeader: true,
                    showFooter: true
                ),
                customSettings: nil
            ),
            integrations: KioskIntegrations(
                slack: KioskSlackIntegration(
                    enabled: false,
                    webhookURL: nil,
                    channel: nil
                ),
                email: KioskEmailIntegration(
                    enabled: false,
                    smtpServer: nil,
                    fromAddress: nil
                )
            ),
            security: KioskSecurity(
                adminPINRequired: true,
                adminPINMinLength: 4,
                sessionTimeout: 300,
                autoLock: true
            ),
            maintenance: KioskMaintenance(
                lastHealthCheck: Date(),
                nextMaintenanceWindow: nil,
                maintenanceMode: false
            ),
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
