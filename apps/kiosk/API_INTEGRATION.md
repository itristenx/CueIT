# CueIT Kiosk API Integration Documentation

## Overview

This document describes the API integration for the CueIT Kiosk application, including authentication, configuration management, and status synchronization.

## Table of Contents

1. [Authentication](#authentication)
2. [Kiosk Registration](#kiosk-registration)
3. [Activation Process](#activation-process)
4. [Configuration Management](#configuration-management)
5. [Status Management](#status-management)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Authentication

### Token-Based Authentication

The kiosk uses JWT tokens for authentication with the backend API.

```swift
// Token storage
UserDefaults.standard.set(token, forKey: "kioskToken")

// Token usage in API calls
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

### Token Validation

```swift
func validateKioskToken(serverURL: String) async -> Bool {
    // Validates the current token with the server
    // Returns true if valid, false if expired or invalid
}
```

## Kiosk Registration

### Initial Registration

```swift
func registerKiosk(id: String, version: String, serverURL: String) async -> Bool {
    // Registers a new kiosk with the server
    // Returns true if successful
}
```

### Registration Payload

```json
{
  "id": "kiosk-uuid",
  "version": "1.0.0",
  "token": "temporary-token"
}
```

## Activation Process

### QR Code Activation

1. **Generate Activation Code**: Admin generates QR code in web interface
2. **Scan QR Code**: Kiosk scans QR code using camera
3. **Submit Activation**: Send activation code to server
4. **Receive Token**: Server returns JWT token for authenticated operations

```swift
func activateKiosk(activationCode: String, serverURL: String) async -> Bool {
    // Activates kiosk using activation code
    // Stores received token for future API calls
}
```

### Activation Payload

```json
{
  "activationCode": "ABC123DEF456"
}
```

### Activation Response

```json
{
  "success": true,
  "token": "jwt-token-here",
  "kioskId": "assigned-kiosk-id",
  "expiresAt": "2025-07-15T12:00:00Z"
}
```

## Configuration Management

### Fetching Configuration

```swift
func getKioskConfiguration(serverURL: String) async -> KioskConfiguration? {
    // Fetches current kiosk configuration from server
}
```

### Configuration Refresh

```swift
func refreshKioskConfiguration(serverURL: String) async -> KioskConfiguration? {
    // Refreshes configuration with latest server settings
    // Called periodically or when configuration changes
}
```

### Configuration Structure

```typescript
interface KioskConfiguration {
  id: string;
  name: string;
  roomName: string;
  location?: string;
  department?: string;
  mode: KioskMode;
  status: KioskStatus;
  settings: KioskSettings;
  ui: KioskUIConfig;
  integrations: KioskIntegrations;
  security: KioskSecurity;
  maintenance: KioskMaintenance;
  createdAt: Date;
  updatedAt: Date;
}
```

## Status Management

### Status Types

```swift
enum KioskStatus: String, CaseIterable {
    case available = "available"
    case inUse = "in-use"
    case meeting = "meeting"
    case brb = "brb"
    case lunch = "lunch"
    case unavailable = "unavailable"
}
```

### Status Synchronization

```swift
func updateKioskStatus(kioskId: String, status: KioskStatus, serverURL: String) async -> Bool {
    // Updates kiosk status on server
    // Called when status changes locally
}
```

### Status Payload

```json
{
  "status": "available",
  "timestamp": "2025-07-15T12:00:00Z",
  "manualOverride": false
}
```

### Periodic Status Sync

The kiosk automatically syncs status every 2 minutes:

```swift
private func startStatusSync() {
    statusTimer = Timer.scheduledTimer(withTimeInterval: 120.0, repeats: true) { _ in
        Task {
            await self.syncWithBackend()
        }
    }
}
```

## Error Handling

### Error Types

```swift
enum KioskError.ErrorType {
    case networkError      // Connection issues
    case authenticationError // Token expired/invalid
    case configurationError // Configuration problems
    case serverError       // Server-side errors
    case unknown          // Unknown errors
}
```

### Error Recovery

```swift
private func handleSpecificError(_ error: KioskError) {
    switch error.type {
    case .networkError:
        // Auto-retry after 5 seconds
        scheduleRetry(after: 5.0)
    case .authenticationError:
        // Navigate to activation flow
        notifyAuthenticationRequired()
    case .configurationError:
        // Refresh configuration
        Task { await refreshConfiguration() }
    case .serverError:
        // Check server status
        Task { await checkServerStatus() }
    }
}
```

### Retry Logic

```swift
private func syncWithRetry(maxRetries: Int = 3) async {
    var retryCount = 0
    
    while retryCount < maxRetries {
        let success = await performSync()
        if success { return }
        
        retryCount += 1
        let delay = pow(2.0, Double(retryCount)) // Exponential backoff
        try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
    }
}
```

## Testing

### Unit Tests

```swift
func testKioskActivation() async {
    let result = await apiService.activateKiosk(
        activationCode: "TEST123",
        serverURL: "http://localhost:3000"
    )
    XCTAssertTrue(result || isMocked)
}
```

### Integration Tests

```swift
func testCompleteKioskSetupFlow() async {
    // 1. Configure server
    configManager.setServerConfiguration(testConfig)
    
    // 2. Test connection
    let isConnected = await apiService.testConnection(serverURL: testConfig.baseURL)
    
    // 3. Register kiosk
    let registrationResult = await apiService.registerKiosk(...)
    
    // 4. Test status management
    statusManager.setStatus(.available)
    
    // 5. Test configuration refresh
    await configManager.refreshConfiguration()
}
```

### Running Tests

```bash
# Run from Xcode
⌘ + U

# Run specific test
xcodebuild test -scheme "CueIT Kiosk" -destination "platform=iOS Simulator,name=iPad Pro (12.9-inch)"
```

## Troubleshooting

### Common Issues

#### 1. Activation Fails

**Symptoms**: QR code scan succeeds but activation returns false

**Solutions**:
- Verify activation code is not expired
- Check server connectivity
- Ensure kiosk is not already activated
- Verify server URL is correct

#### 2. Configuration Not Updating

**Symptoms**: Changes made in admin interface don't appear on kiosk

**Solutions**:
- Check token validity: `await apiService.validateKioskToken(serverURL)`
- Force refresh: `await configManager.refreshConfiguration()`
- Verify kiosk is activated: `configManager.isActivated`

#### 3. Status Sync Issues

**Symptoms**: Status changes don't appear on admin interface

**Solutions**:
- Check network connectivity
- Verify status sync timer: `statusManager.startMonitoring()`
- Check for authentication errors in logs
- Test manual sync: `await statusManager.syncWithBackend()`

#### 4. Token Expiration

**Symptoms**: API calls return 401 errors

**Solutions**:
- Implement token refresh mechanism
- Guide user through reactivation process
- Clear stored token: `UserDefaults.standard.removeObject(forKey: "kioskToken")`

### Debug Mode

Enable debug logging for detailed API information:

```swift
// In development builds
#if DEBUG
    print("API Request: \(request.url?.absoluteString ?? "unknown")")
    print("Response: \(response)")
#endif
```

### Health Check

Implement a health check endpoint to verify all systems:

```swift
func performHealthCheck() async -> HealthStatus {
    let serverConnected = await testConnection()
    let tokenValid = await validateKioskToken()
    let configCurrent = lastConfigUpdate > Date().addingTimeInterval(-3600)
    
    return HealthStatus(
        serverConnected: serverConnected,
        tokenValid: tokenValid,
        configCurrent: configCurrent
    )
}
```

## API Endpoints Reference

### Core Endpoints

- `GET /api/health` - Server health check
- `POST /api/register-kiosk` - Register new kiosk
- `POST /api/kiosks/activate` - Activate kiosk with code
- `GET /api/kiosks/configuration` - Get kiosk configuration
- `PUT /api/kiosks/{id}/status` - Update kiosk status
- `POST /api/kiosks/validate-token` - Validate authentication token

### Request Headers

All authenticated requests require:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Response Format

Standard success response:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-07-15T12:00:00Z"
}
```

Standard error response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid or expired"
  },
  "timestamp": "2025-07-15T12:00:00Z"
}
```

## Security Considerations

### Token Security

- Tokens are stored in UserDefaults (consider Keychain for production)
- Tokens should be validated before each API call
- Implement token refresh mechanism for long-running kiosks

### Network Security

- Use HTTPS for all production API calls
- Implement certificate pinning for enhanced security
- Validate server certificates

### Data Protection

- Sensitive configuration data should be encrypted
- Clear tokens and configuration on factory reset
- Implement proper session timeout handling

## Performance Optimization

### Caching

- Cache configuration locally to reduce API calls
- Implement intelligent refresh intervals
- Use background queues for API operations

### Network Efficiency

- Batch status updates when possible
- Use compression for large configuration payloads
- Implement request deduplication

### Battery Optimization

- Reduce sync frequency when on battery power
- Use background app refresh efficiently
- Implement smart wake-up scheduling

## Monitoring and Analytics

### Error Tracking

- Log all API errors with context
- Track error rates and patterns
- Implement crash reporting

### Performance Metrics

- Track API response times
- Monitor configuration refresh frequency
- Measure battery impact

### Usage Analytics

- Track kiosk activation success rates
- Monitor configuration change frequency
- Measure user interaction patterns

---

**Last Updated**: July 15, 2025  
**Version**: 1.0.0  
**Author**: CueIT Development Team
