import XCTest
@testable import Nova_Beacon_Kiosk

final class APIConfigTests: XCTestCase {
    func testDefaultBaseURL() {
        XCTAssertEqual(APIConfig.baseURL, "https://localhost:3000")
    }
}
