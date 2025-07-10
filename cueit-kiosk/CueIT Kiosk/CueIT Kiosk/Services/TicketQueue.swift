import Foundation
import Network
import CryptoKit

struct QueuedTicket: Codable, Identifiable {
  let id: UUID
  let name: String
  let email: String
  let title: String
  let manager: String
  let system: String
  let urgency: String

  init(name: String, email: String, title: String, manager: String, system: String, urgency: String) {
    self.id = UUID()
    self.name = name
    self.email = email
    self.title = title
    self.manager = manager
    self.system = system
    self.urgency = urgency
  }
}

class TicketQueue: ObservableObject {
  static let shared = TicketQueue()
  @Published private(set) var tickets: [QueuedTicket] = []

  private let fileURL: URL
  private let monitor = NWPathMonitor()
  private let key: SymmetricKey

  private init() {
    let fm = FileManager.default
    let dir = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
    fileURL = dir.appendingPathComponent("queued-tickets.json")
    // Use UserDefaults for now to avoid KeychainService import issues
    if let saved = UserDefaults.standard.string(forKey: "ticketEncryptionKey"),
       let data = Data(base64Encoded: saved) {
      key = SymmetricKey(data: data)
    } else {
      let newKey = SymmetricKey(size: .bits256)
      key = newKey
      let keyData = newKey.withUnsafeBytes { Data($0) }
      UserDefaults.standard.set(keyData.base64EncodedString(), forKey: "ticketEncryptionKey")
    }
    Task { @MainActor in
      self.load()
    }
    monitor.pathUpdateHandler = { path in
      if path.status == .satisfied {
        Task { @MainActor in
          self.retry()
        }
      }
    }
    monitor.start(queue: DispatchQueue.global(qos: .background))
  }

  private func encrypt(_ data: Data) -> Data? {
    try? AES.GCM.seal(data, using: key).combined
  }

  private func decrypt(_ data: Data) -> Data? {
    guard let box = try? AES.GCM.SealedBox(combined: data) else { return nil }
    return try? AES.GCM.open(box, using: key)
  }

  @MainActor
  private func load() {
    guard let stored = try? Data(contentsOf: fileURL) else { return }
    let jsonData = decrypt(stored) ?? stored
    if let decoded = try? JSONDecoder().decode([QueuedTicket].self, from: jsonData) {
      tickets = decoded
    }
  }

  private func save() {
    if let data = try? JSONEncoder().encode(tickets),
       let encrypted = encrypt(data) {
      try? encrypted.write(to: fileURL, options: .completeFileProtection)
    }
  }

  @MainActor
  func enqueue(_ ticket: QueuedTicket) {
    tickets.append(ticket)
    save()
  }

  @MainActor
  private func remove(_ ticket: QueuedTicket) {
    tickets.removeAll { $0.id == ticket.id }
    save()
  }

  @MainActor
  func retry() {
    guard !tickets.isEmpty else { return }
    let ticketsToRetry = tickets // Create a copy to avoid modifying during iteration
    for ticket in ticketsToRetry {
      Task { @MainActor in
        let success = await sendTicketAsync(ticket)
        if success {
          self.remove(ticket)
        }
      }
    }
  }

  private func send(_ ticket: QueuedTicket, completion: @escaping (Bool) -> Void) {
    Task { @MainActor in
      let success = await sendTicketAsync(ticket)
      completion(success)
    }
  }
  
  private func sendTicketAsync(_ ticket: QueuedTicket) async -> Bool {
    // Use a hardcoded URL for now to avoid APIConfig dependency issues
    guard let url = URL(string: "http://localhost:3000/submit-ticket") else {
      return false
    }
    
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body: [String: String] = [
      "name": ticket.name,
      "email": ticket.email,
      "title": ticket.title,
      "manager": ticket.manager,
      "system": ticket.system,
      "urgency": ticket.urgency
    ]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    do {
      let (_, _) = try await URLSession.shared.data(for: req)
      return true
    } catch {
      return false
    }
  }
}
