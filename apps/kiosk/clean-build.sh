#!/bin/bash

# QueueIT Kiosk - Clean Build Script
# This script cleans Xcode derived data and rebuilds the project

echo "🧹 Cleaning QueueIT Kiosk build environment..."

# Clean Xcode derived data
echo "Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/QueueIT*

# Navigate to project directory
cd "$(dirname "$0")/QueueIT Kiosk"

# Clean the project
echo "Cleaning Xcode project..."
xcodebuild clean -project "QueueIT Kiosk.xcodeproj" -scheme "QueueIT Kiosk" -configuration Debug

# Build the project
echo "Building QueueIT Kiosk..."
xcodebuild build -project "QueueIT Kiosk.xcodeproj" -scheme "QueueIT Kiosk" -configuration Debug -destination "platform=iOS Simulator,name=iPad Pro 13-inch (M4)"

echo "✅ Build complete!"
