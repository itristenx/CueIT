import Foundation

// MARK: - Directory User
struct DirectoryUser: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let department: String?
    let title: String?
    let manager: String?
    let phone: String?
    let location: String?
    let photoURL: String?
    
    var displayName: String {
        return name.isEmpty ? email : name
    }
    
    var initials: String {
        let components = name.components(separatedBy: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        } else if !name.isEmpty {
            return String(name.prefix(1)).uppercased()
        } else {
            return String(email.prefix(1)).uppercased()
        }
    }
}

// MARK: - Kiosk Info
struct KioskInfo: Codable, Identifiable {
    let id: String
    let name: String
    let location: String?
    let description: String?
    let status: String
    let lastSeen: Date?
    
    var displayName: String {
        return name.isEmpty ? "Kiosk \(id)" : name
    }
    
    var isOnline: Bool {
        guard let lastSeen = lastSeen else { return false }
        return Date().timeIntervalSince(lastSeen) < 300 // 5 minutes
    }
    
    // Default initializer for Codable conformance
    init(id: String, name: String, location: String? = nil, description: String? = nil, status: String = "unknown", lastSeen: Date? = nil) {
        self.id = id
        self.name = name
        self.location = location
        self.description = description
        self.status = status
        self.lastSeen = lastSeen
    }
}

// MARK: - Office Hours Configuration
struct OfficeHoursConfig: Codable {
    let enabled: Bool
    let timezone: String
    let schedule: WeeklySchedule
    let holidays: [Holiday]
    let closureMessage: String?
    
    struct Holiday: Codable, Identifiable {
        let id: String
        let name: String
        let date: Date
        let isRecurring: Bool
    }
    
    func isOpen(at date: Date = Date()) -> Bool {
        guard enabled else { return true }
        
        // Check if it's a holiday
        let calendar = Calendar.current
        if holidays.contains(where: { holiday in
            if holiday.isRecurring {
                return calendar.isDate(date, inSameDayAs: holiday.date)
            } else {
                return calendar.isDate(date, inSameDayAs: holiday.date)
            }
        }) {
            return false
        }
        
        // Check weekly schedule
        let weekday = calendar.component(.weekday, from: date)
        let daySchedule = schedule.getDaySchedule(for: weekday)
        
        return daySchedule?.isOpen(at: date) ?? false
    }
}

// MARK: - Weekly Schedule
struct WeeklySchedule: Codable {
    let monday: DaySchedule?
    let tuesday: DaySchedule?
    let wednesday: DaySchedule?
    let thursday: DaySchedule?
    let friday: DaySchedule?
    let saturday: DaySchedule?
    let sunday: DaySchedule?
    
    func getDaySchedule(for weekday: Int) -> DaySchedule? {
        switch weekday {
        case 1: return sunday
        case 2: return monday
        case 3: return tuesday
        case 4: return wednesday
        case 5: return thursday
        case 6: return friday
        case 7: return saturday
        default: return nil
        }
    }
}

// MARK: - Day Schedule
struct DaySchedule: Codable {
    let isOpen: Bool
    let timeSlots: [TimeSlot]
    
    func isOpen(at date: Date) -> Bool {
        guard isOpen else { return false }
        
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: date)
        let minute = calendar.component(.minute, from: date)
        let currentMinutes = hour * 60 + minute
        
        return timeSlots.contains { slot in
            slot.contains(minutes: currentMinutes)
        }
    }
}

// MARK: - Time Slot
struct TimeSlot: Codable {
    let startHour: Int
    let startMinute: Int
    let endHour: Int
    let endMinute: Int
    
    var startMinutes: Int {
        return startHour * 60 + startMinute
    }
    
    var endMinutes: Int {
        return endHour * 60 + endMinute
    }
    
    func contains(minutes: Int) -> Bool {
        return minutes >= startMinutes && minutes <= endMinutes
    }
    
    var displayTime: String {
        let startTime = String(format: "%02d:%02d", startHour, startMinute)
        let endTime = String(format: "%02d:%02d", endHour, endMinute)
        return "\(startTime) - \(endTime)"
    }
}
