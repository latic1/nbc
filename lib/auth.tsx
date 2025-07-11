"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  permissions: string[]
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock user data with permissions
  const mockUsers = [
    {
      id: "USR-001",
      firstName: "John",
      lastName: "Surveyor",
      email: "admin@nbc.gov.lr",
      password: "admin123",
      role: "System Administrator",
      department: "IT Department",
      permissions: [
        "cadastre.view",
        "cadastre.create",
        "cadastre.edit",
        "cadastre.delete",
        "cadastre.validate",
        "concessions.view",
        "concessions.create",
        "concessions.edit",
        "concessions.approve",
        "concessions.renew",
        "gis.view",
        "gis.edit",
        "gis.export",
        "gis.analysis",
        "users.view",
        "users.create",
        "users.edit",
        "users.delete",
        "roles.manage",
        "reports.view",
        "reports.create",
        "reports.export",
        "system.settings",
        "system.audit",
        "system.backup",
        "logs.view",
      ],
    },
    {
      id: "USR-002",
      firstName: "Mary",
      lastName: "Manager",
      email: "manager@nbc.gov.lr",
      password: "manager123",
      role: "Division Manager",
      department: "Cadastre Division",
      permissions: [
        "cadastre.view",
        "cadastre.create",
        "cadastre.edit",
        "cadastre.validate",
        "concessions.view",
        "concessions.create",
        "concessions.edit",
        "concessions.approve",
        "gis.view",
        "gis.edit",
        "gis.analysis",
        "reports.view",
        "reports.create",
        "reports.export",
        "users.view",
        "system.audit",
      ],
    },
    {
      id: "USR-003",
      firstName: "James",
      lastName: "Surveyor",
      email: "surveyor@nbc.gov.lr",
      password: "surveyor123",
      role: "Senior Surveyor",
      department: "Cadastre Division",
      permissions: [
        "cadastre.view",
        "cadastre.create",
        "cadastre.edit",
        "cadastre.validate",
        "gis.view",
        "gis.edit",
        "gis.analysis",
        "gis.export",
        "reports.view",
        "reports.create",
      ],
    },
  ]

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("auth_token", "mock_token_" + foundUser.id)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
