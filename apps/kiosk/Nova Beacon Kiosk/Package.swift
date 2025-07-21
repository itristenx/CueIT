// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Nova-Beacon-Kiosk",
    platforms: [
        .iOS(.v15),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "Nova-Beacon-Kiosk",
            targets: ["Nova-Beacon-Kiosk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/twostraws/CodeScanner", from: "2.3.0")
    ],
    targets: [
        .target(
            name: "Nova-Beacon-Kiosk",
            dependencies: [
                .product(name: "CodeScanner", package: "CodeScanner")
            ],
            path: "CueIT Kiosk",
            exclude: ["Info.plist", "Assets.xcassets"]
        )
    ]
)
