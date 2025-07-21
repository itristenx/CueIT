#!/bin/bash

# Nova Beacon Kiosk - Clean Build Script
# This script cleans Xcode derived data and rebuilds the project

echo "🧹 Cleaning Nova Beacon Kiosk build environment..."

# Clean Xcode derived data
echo "Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Nova*

# Navigate to project directory
cd "$(dirname "$0")/CueIT Kiosk"

# Clean the project
echo "Cleaning Xcode project..."
xcodebuild clean -project "CueIT Kiosk.xcodeproj" -scheme "CueIT Kiosk" -configuration Debug

# Build the project
echo "Building Nova Beacon Kiosk..."
xcodebuild build -project "CueIT Kiosk.xcodeproj" -scheme "CueIT Kiosk" -configuration Debug -destination "platform=iOS Simulator,name=iPad Pro 13-inch (M4)"

echo "✅ Build complete!"
