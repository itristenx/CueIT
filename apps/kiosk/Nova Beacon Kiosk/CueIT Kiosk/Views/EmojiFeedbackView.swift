//
//  EmojiFeedbackView.swift
//  Nova Beacon
//
//  Emoji feedback view for bathroom kiosk mode
//

import SwiftUI

struct EmojiFeedbackView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var selectedEmoji: FeedbackEmoji? = nil
    @State private var showThankYou = false
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    
    enum FeedbackEmoji: String, CaseIterable {
        case veryHappy = "😃"
        case happy = "😊"
        case neutral = "😐"
        case unhappy = "😞"
        case veryUnhappy = "😠"
        
        var title: String {
            switch self {
            case .veryHappy:
                return "Very Happy"
            case .happy:
                return "Happy"
            case .neutral:
                return "Neutral"
            case .unhappy:
                return "Unhappy"
            case .veryUnhappy:
                return "Very Unhappy"
            }
        }
        
        var rating: Int {
            switch self {
            case .veryHappy:
                return 5
            case .happy:
                return 4
            case .neutral:
                return 3
            case .unhappy:
                return 2
            case .veryUnhappy:
                return 1
            }
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                LinearGradient(
                    colors: [
                        Color.blue.opacity(0.1),
                        Color.white
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                VStack(spacing: 40) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "face.smiling")
                            .font(.system(size: 60, weight: .light))
                            .foregroundColor(.blue)
                        
                        Text("How was your experience?")
                            .font(.system(size: 32, weight: .semibold))
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.center)
                        
                        Text("Your feedback helps us improve our facilities")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Emoji Grid
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 20), count: 3), spacing: 30) {
                        ForEach(FeedbackEmoji.allCases, id: \.rawValue) { emoji in
                            EmojiButton(
                                emoji: emoji,
                                isSelected: selectedEmoji == emoji,
                                isSubmitting: isSubmitting
                            ) {
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    selectedEmoji = emoji
                                }
                                
                                // Auto-submit after selection
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                    if selectedEmoji == emoji {
                                        submitFeedback()
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 40)
                    
                    Spacer()
                    
                    // Footer
                    VStack(spacing: 12) {
                        if let errorMessage = errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                        }
                        
                        Text("Tap an emoji to submit your feedback")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.secondary)
                            .opacity(selectedEmoji == nil ? 1 : 0)
                    }
                    .padding(.bottom, 40)
                }
                
                // Thank you overlay
                if showThankYou {
                    thankYouOverlay
                }
            }
        }
    }
    
    private var thankYouOverlay: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80, weight: .light))
                    .foregroundColor(.green)
                
                Text("Thank you!")
                    .font(.system(size: 36, weight: .semibold))
                    .foregroundColor(.white)
                
                Text("Your feedback has been submitted")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
            }
            .padding(40)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
            )
        }
        .transition(.opacity.combined(with: .scale(scale: 0.8)))
    }
    
    private func submitFeedback() {
        guard let emoji = selectedEmoji else { return }
        
        isSubmitting = true
        errorMessage = nil
        
        Task {
            do {
                // Submit feedback to API
                await submitFeedbackToAPI(emoji: emoji)
                
                // Show thank you message
                await MainActor.run {
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                        showThankYou = true
                    }
                }
                
                // Auto-reset after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                        showThankYou = false
                        selectedEmoji = nil
                        isSubmitting = false
                    }
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to submit feedback. Please try again."
                    isSubmitting = false
                    selectedEmoji = nil
                }
            }
        }
    }
    
    private func submitFeedbackToAPI(emoji: FeedbackEmoji) async {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/feedback") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let feedbackData = [
            "kioskId": KioskService.shared.id,
            "type": "bathroom",
            "rating": emoji.rating,
            "emoji": emoji.rawValue,
            "roomName": configManager.currentRoomName,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: feedbackData)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }
}

struct EmojiButton: View {
    let emoji: EmojiFeedbackView.FeedbackEmoji
    let isSelected: Bool
    let isSubmitting: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Text(emoji.rawValue)
                    .font(.system(size: 60))
                    .scaleEffect(isSelected ? 1.2 : 1.0)
                    .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
                
                Text(emoji.title)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.primary)
            }
            .frame(width: 120, height: 120)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(isSelected ? Color.blue.opacity(0.1) : Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(
                                isSelected ? Color.blue : Color.gray.opacity(0.3),
                                lineWidth: isSelected ? 3 : 1
                            )
                    )
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(isSubmitting)
    }
}

#Preview {
    EmojiFeedbackView()
}
