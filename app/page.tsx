"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  MapPin,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Loader2,
  Bell,
  Settings,
  Key,
  Activity,
  Database,
  Shield,
  Globe,
  BarChart3,
  Calendar,
} from "lucide-react"
import { CadastreTable } from "./components/cadastre-table"
import { ConcessionsTable } from "./components/concessions-table"
import { UserManagement } from "./components/user-management"
import { RoleManagement } from "./components/role-management"
import { UserProfile } from "./components/user-profile"
import { SystemLogs } from "./components/system-logs"
import { ParcelRegistrationForm } from "./components/parcel-registration-form"
import { DatabaseService, initializeDatabase } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardStats, setDashboardStats] = useState({
    totalParcels: 0,
    totalConcessions: 0,
    totalUsers: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    activeConflicts: 0,
    systemHealth: "Good",
    lastBackup: "2024-01-25 02:00:00",
    // Additional statistics
    registeredToday: 0,
    registeredThisWeek: 0,
    registeredThisMonth: 0,
    averageProcessingTime: "3.2 days",
    complianceRate: 87,
    activeApiKeys: 0,
    totalApiRequests: 0,
    systemUptime: "99.8%",
    storageUsed: 68,
    totalCounties: 15,
    totalDistricts: 136,
    activeSurveyors: 0,
    pendingValidations: 0,
    expiringSoon: 0,
    revenueGrowth: 12.5,
    userGrowth: 8.3,
    dataQualityScore: 94,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dbConnected, setDbConnected] = useState(false)
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      setIsLoading(true)

      // Initialize database connection
      const connected = await initializeDatabase()
      setDbConnected(connected)

      if (connected) {
        await loadDashboardStats()
        await loadRecentActivities()
        toast({
          title: "System Ready",
          description: "Database connected and dashboard loaded successfully",
        })
      } else {
        toast({
          title: "Connection Warning",
          description: "Database connection failed, using offline mode",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to initialize dashboard:", error)
      toast({
        title: "Initialization Error",
        description: "Failed to initialize dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const [parcels, concessions, users, logs, apiKeys] = await Promise.all([
        DatabaseService.getParcels(),
        DatabaseService.getConcessions(),
        DatabaseService.getUsers(),
        DatabaseService.getLogs(),
        DatabaseService.getApiKeys(),
      ])

      // Calculate time-based statistics
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const registeredToday = parcels.filter(
        (p) => new Date(p.created_at || p.registered) >= new Date(today.toDateString()),
      ).length

      const registeredThisWeek = parcels.filter((p) => new Date(p.created_at || p.registered) >= weekAgo).length

      const registeredThisMonth = parcels.filter((p) => new Date(p.created_at || p.registered) >= monthAgo).length

      const stats = {
        totalParcels: parcels.length,
        totalConcessions: concessions.length,
        totalUsers: users.length,
        pendingApplications: concessions.filter((c) => c.status === "Application" || c.status === "Under Review")
          .length,
        totalRevenue: concessions.reduce((sum, c) => {
          const revenue = Number.parseFloat(c.revenue?.replace(/[$M,]/g, "") || "0")
          return sum + revenue
        }, 0),
        activeConflicts: parcels.reduce((sum, p) => sum + (p.conflicts || 0), 0),
        systemHealth: "Good",
        lastBackup: "2024-01-25 02:00:00",
        registeredToday,
        registeredThisWeek,
        registeredThisMonth,
        averageProcessingTime: "3.2 days",
        complianceRate:
          Math.round(
            (concessions.filter((c) => c.compliance === "Good" || c.compliance === "Excellent").length /
              concessions.length) *
              100,
          ) || 0,
        activeApiKeys: apiKeys?.filter((k) => k.status === "active").length || 0,
        totalApiRequests: apiKeys?.reduce((sum, k) => sum + (k.requestCount || 0), 0) || 0,
        systemUptime: "99.8%",
        storageUsed: 68,
        totalCounties: 15,
        totalDistricts: 136,
        activeSurveyors: users.filter((u) => u.role?.includes("Surveyor") && u.status === "Active").length,
        pendingValidations: parcels.filter((p) => p.status === "Pending").length,
        expiringSoon: concessions.filter((c) => {
          if (!c.expires || c.expires === "-") return false
          const expiryDate = new Date(c.expires)
          const sixMonthsFromNow = new Date(today.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)
          return expiryDate <= sixMonthsFromNow
        }).length,
        revenueGrowth: 12.5,
        userGrowth: 8.3,
        dataQualityScore: 94,
      }

      setDashboardStats(stats)
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    }
  }

  const loadRecentActivities = async () => {
    try {
      const logs = await DatabaseService.getLogs({ limit: 10 })
      setRecentActivities(logs.slice(0, 8))
    } catch (error) {
      console.error("Failed to load recent activities:", error)
    }
  }

  // const handleRefreshStats = async () => {
  //   setIsLoading(true)
  //   await loadDashboardStats()
  //   await loadRecentActivities()
  //   setIsLoading(false)
  //   toast({
  //     title: "Refreshed",
  //     description: "Dashboard statistics updated",
  //   })
  // }

  const handleNavigateToApiManagement = () => {
    window.location.href = "/api-management"
  }

  const handleNavigateToNotifications = () => {
    window.location.href = "/notifications"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Initializing NBC LandSight</h2>
          <p className="text-gray-600">Connecting to database and loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NBC LandSight</h1>
                <p className="text-sm text-gray-600">Cadastre & Concessions Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${dbConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-600">{dbConnected ? "Connected" : "Offline"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleNavigateToNotifications}>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleNavigateToApiManagement}>
                <Key className="h-4 w-4 mr-2" />
                API Management
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cadastre">Cadastre</TabsTrigger>
            <TabsTrigger value="concessions">Concessions</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">System statistics and key metrics</p>
              </div>
            </div>

            {/* Primary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalParcels.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{dashboardStats.registeredThisMonth} this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Concessions</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalConcessions}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.pendingApplications} pending applications
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">{dashboardStats.activeSurveyors} active surveyors</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardStats.totalRevenue.toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">+{dashboardStats.revenueGrowth}% growth</p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.registeredToday}</div>
                  <p className="text-xs text-muted-foreground">{dashboardStats.registeredThisWeek} this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.complianceRate}%</div>
                  <Progress value={dashboardStats.complianceRate} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalApiRequests.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{dashboardStats.activeApiKeys} active keys</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.systemUptime}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.dataQualityScore}%</div>
                  <Progress value={dashboardStats.dataQualityScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Metrics</CardTitle>
                  <CardDescription>Application processing and validation statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Processing Time</span>
                    <Badge variant="outline">{dashboardStats.averageProcessingTime}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Validations</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{dashboardStats.pendingValidations}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expiring Soon</span>
                    <Badge className="bg-orange-100 text-orange-800">{dashboardStats.expiringSoon}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Conflicts</span>
                    {dashboardStats.activeConflicts > 0 ? (
                      <Badge className="bg-red-100 text-red-800">{dashboardStats.activeConflicts}</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">None</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Coverage</CardTitle>
                  <CardDescription>Administrative divisions and coverage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Counties</span>
                    <span className="font-medium">{dashboardStats.totalCounties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Districts</span>
                    <span className="font-medium">{dashboardStats.totalDistricts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coverage Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-16" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage Used</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={dashboardStats.storageUsed} className="w-16" />
                      <span className="text-sm">{dashboardStats.storageUsed}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Database Connection</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>API Services</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      <span>Backup Status</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span>Last Backup</span>
                    </div>
                    <span className="text-sm text-gray-600">{dashboardStats.lastBackup}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("registration")}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Register New Parcel
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("concessions")}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Manage Concessions
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button
                    className="w-full justify-start bg-transparent"
                    variant="outline"
                    onClick={() => setActiveTab("logs")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View System Logs
                  </Button>
                  <Link href="/public-portal" className="block">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Public Portal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              activity.level === "error"
                                ? "bg-red-500"
                                : activity.level === "warning"
                                  ? "bg-yellow-500"
                                  : activity.level === "info"
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">
                              {activity.userName || "System"} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activities</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cadastre">
            <CadastreTable />
          </TabsContent>

          <TabsContent value="concessions">
            <ConcessionsTable />
          </TabsContent>

          <TabsContent value="registration">
            <ParcelRegistrationForm />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
