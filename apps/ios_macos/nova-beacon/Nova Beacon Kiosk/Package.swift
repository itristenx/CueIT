// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NovaBeaconKiosk",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "NovaBeaconKiosk",
            targets: ["NovaBeaconKiosk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/twostraws/CodeScanner", from: "2.3.0")
    ],
    targets: [
        .target(
            name: "NovaBeaconKiosk",
            dependencies: [
                .product(name: "CodeScanner", package: "CodeScanner")
            ],
            path: "Nova Beacon Kiosk",
            exclude: ["Info.plist", "Assets.xcassets"]
        )
    ]
)
