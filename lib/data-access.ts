"use client"

// Mock data access layer - replace with actual API calls
export interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  category: string
  message: string
  userId?: string
  userName?: string
  ipAddress: string
  details?: any
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  total?: number
}

class DataAccessLayer {
  private baseUrl = "/api" // Replace with actual API base URL

  // Mock logs data
  private mockLogs: LogEntry[] = [
    {
      id: "LOG-001",
      timestamp: "2024-01-25 14:30:22",
      level: "info",
      category: "Authentication",
      message: "User logged in successfully",
      userId: "USR-001",
      userName: "John Surveyor",
      ipAddress: "192.168.1.45",
      details: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    },
    {
      id: "LOG-002",
      timestamp: "2024-01-25 14:25:15",
      level: "info",
      category: "Cadastre",
      message: "New parcel registered",
      userId: "USR-001",
      userName: "John Surveyor",
      ipAddress: "192.168.1.45",
      details: { parcelId: "PAR-2024-001", area: "125.5 ha" },
    },
    {
      id: "LOG-003",
      timestamp: "2024-01-25 13:45:08",
      level: "warning",
      category: "Validation",
      message: "Spatial validation warning detected",
      userId: "USR-002",
      userName: "Mary Manager",
      ipAddress: "192.168.1.23",
      details: { parcelId: "PAR-2024-002", warning: "Minor overlap detected" },
    },
    {
      id: "LOG-004",
      timestamp: "2024-01-25 11:20:33",
      level: "error",
      category: "System",
      message: "Database connection timeout",
      ipAddress: "127.0.0.1",
      details: { error: "Connection timeout after 30 seconds", database: "cadastre_db" },
    },
    {
      id: "LOG-005",
      timestamp: "2024-01-25 10:15:44",
      level: "info",
      category: "Concessions",
      message: "Concession application submitted",
      userId: "USR-003",
      userName: "James Surveyor",
      ipAddress: "192.168.1.67",
      details: { concessionId: "CON-2024-001", type: "Mining" },
    },
    {
      id: "LOG-006",
      timestamp: "2024-01-24 16:30:12",
      level: "debug",
      category: "GIS",
      message: "Map layer updated",
      userId: "USR-001",
      userName: "John Surveyor",
      ipAddress: "192.168.1.45",
      details: { layer: "county_boundaries", operation: "update" },
    },
    {
      id: "LOG-007",
      timestamp: "2024-01-24 15:22:18",
      level: "error",
      category: "Authentication",
      message: "Failed login attempt",
      ipAddress: "192.168.1.100",
      details: { email: "unknown@example.com", reason: "Invalid credentials" },
    },
    {
      id: "LOG-008",
      timestamp: "2024-01-24 14:18:55",
      level: "info",
      category: "Reports",
      message: "Report generated successfully",
      userId: "USR-002",
      userName: "Mary Manager",
      ipAddress: "192.168.1.23",
      details: { reportType: "Monthly Summary", format: "PDF" },
    },
  ]

  async getLogs(filters?: {
    level?: string
    category?: string
    startDate?: string
    endDate?: string
    userId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<LogEntry[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredLogs = [...this.mockLogs]

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter((log) => log.level === filters.level)
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter((log) => log.category === filters.category)
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.endDate!)
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return {
      data: paginatedLogs,
      success: true,
      total: filteredLogs.length,
    }
  }

  async createLog(log: Omit<LogEntry, "id" | "timestamp">): Promise<ApiResponse<LogEntry>> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const newLog: LogEntry = {
      ...log,
      id: `LOG-${String(this.mockLogs.length + 1).padStart(3, "0")}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    }

    this.mockLogs.unshift(newLog)

    return {
      data: newLog,
      success: true,
      message: "Log entry created successfully",
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // This would be replaced with actual API call
    return {
      data: { token: "mock_token", user: { email } },
      success: true,
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      data: null,
      success: true,
      message: "Password reset instructions sent to your email",
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      data: null,
      success: true,
      message: "Password reset successfully",
    }
  }
}

export const dataAccess = new DataAccessLayer()
