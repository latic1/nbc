"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Plus,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MoreHorizontal,
  Send,
  Eye,
  Filter,
} from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  category: string
  priority: "low" | "medium" | "high" | "critical"
  status: "unread" | "read" | "archived"
  createdAt: string
  recipients: string[]
  channels: ("email" | "sms" | "push" | "in_app")[]
  metadata?: any
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: "info" | "warning" | "error" | "success"
  category: string
  channels: ("email" | "sms" | "push" | "in_app")[]
  variables: string[]
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif_001",
      title: "New Parcel Registration",
      message: "A new parcel PAR-2024-001 has been registered in Bong County by John Surveyor.",
      type: "info",
      category: "Cadastre",
      priority: "medium",
      status: "unread",
      createdAt: "2024-01-25 14:30:22",
      recipients: ["manager@example.com", "supervisor@example.com"],
      channels: ["email", "in_app"],
      metadata: { parcelId: "PAR-2024-001", county: "Bong", surveyor: "John Surveyor" },
    },
    {
      id: "notif_002",
      title: "Spatial Validation Warning",
      message: "Spatial validation detected potential boundary overlap for parcel PAR-2024-002.",
      type: "warning",
      category: "Validation",
      priority: "high",
      status: "unread",
      createdAt: "2024-01-25 13:45:15",
      recipients: ["gis@example.com", "quality@example.com"],
      channels: ["email", "sms", "in_app"],
      metadata: { parcelId: "PAR-2024-002", validationType: "boundary_overlap" },
    },
    {
      id: "notif_003",
      title: "System Backup Completed",
      message: "Daily system backup completed successfully. All data has been secured.",
      type: "success",
      category: "System",
      priority: "low",
      status: "read",
      createdAt: "2024-01-25 02:00:00",
      recipients: ["admin@example.com"],
      channels: ["email"],
      metadata: { backupSize: "2.5GB", duration: "45 minutes" },
    },
    {
      id: "notif_004",
      title: "Failed Login Attempts",
      message: "Multiple failed login attempts detected from IP 192.168.1.100. Account temporarily locked.",
      type: "error",
      category: "Security",
      priority: "critical",
      status: "read",
      createdAt: "2024-01-24 16:22:33",
      recipients: ["security@example.com", "admin@example.com"],
      channels: ["email", "sms", "push"],
      metadata: { ipAddress: "192.168.1.100", attempts: 5, account: "unknown@example.com" },
    },
    {
      id: "notif_005",
      title: "Concession Application Submitted",
      message: "New mining concession application CON-2024-001 submitted by Liberia Mining Corp.",
      type: "info",
      category: "Concessions",
      priority: "medium",
      status: "unread",
      createdAt: "2024-01-24 11:15:44",
      recipients: ["concessions@example.com", "legal@example.com"],
      channels: ["email", "in_app"],
      metadata: { concessionId: "CON-2024-001", company: "Liberia Mining Corp", type: "Mining" },
    },
  ])

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: "template_001",
      name: "Parcel Registration Alert",
      subject: "New Parcel Registration - {{parcelId}}",
      content: "A new parcel {{parcelId}} has been registered in {{county}} County by {{surveyor}}.",
      type: "info",
      category: "Cadastre",
      channels: ["email", "in_app"],
      variables: ["parcelId", "county", "surveyor"],
    },
    {
      id: "template_002",
      name: "Validation Warning",
      subject: "Spatial Validation Warning - {{parcelId}}",
      content: "Spatial validation detected {{validationType}} for parcel {{parcelId}}. Please review immediately.",
      type: "warning",
      category: "Validation",
      channels: ["email", "sms", "in_app"],
      variables: ["parcelId", "validationType"],
    },
    {
      id: "template_003",
      name: "Security Alert",
      subject: "Security Alert - {{alertType}}",
      content: "Security event detected: {{description}}. IP: {{ipAddress}}, Time: {{timestamp}}",
      type: "error",
      category: "Security",
      channels: ["email", "sms", "push"],
      variables: ["alertType", "description", "ipAddress", "timestamp"],
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    category: "",
    priority: "medium" as const,
    recipients: "",
    channels: [] as ("email" | "sms" | "push" | "in_app")[],
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "info":
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
      default:
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "push":
        return <Bell className="h-4 w-4" />
      case "in_app":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleCreateNotification = () => {
    const notification: Notification = {
      id: `notif_${String(notifications.length + 1).padStart(3, "0")}`,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      category: newNotification.category,
      priority: newNotification.priority,
      status: "unread",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      recipients: newNotification.recipients.split(",").map((r) => r.trim()),
      channels: newNotification.channels,
    }

    setNotifications([notification, ...notifications])
    setNewNotification({
      title: "",
      message: "",
      type: "info",
      category: "",
      priority: "medium",
      recipients: "",
      channels: [],
    })
    setIsCreateDialogOpen(false)
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, status: "read" } : notif)))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filterStatus !== "all" && notif.status !== filterStatus) return false
    if (filterType !== "all" && notif.type !== filterType) return false
    if (filterCategory !== "all" && notif.category !== filterCategory) return false
    return true
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications Center</h2>
          <p className="text-gray-600">Manage system notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            {unreadCount} unread
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>Send a notification to system users</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newNotification.category}
                      onChange={(e) => setNewNotification({ ...newNotification, category: e.target.value })}
                      placeholder="e.g., Cadastre"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipients (comma-separated emails)</Label>
                  <Textarea
                    value={newNotification.recipients}
                    onChange={(e) => setNewNotification({ ...newNotification, recipients: e.target.value })}
                    placeholder="user1@example.com, user2@example.com"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Channels</Label>
                  <div className="flex space-x-4">
                    {["email", "sms", "push", "in_app"].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={channel}
                          checked={newNotification.channels.includes(channel as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewNotification({
                                ...newNotification,
                                channels: [...newNotification.channels, channel as any],
                              })
                            } else {
                              setNewNotification({
                                ...newNotification,
                                channels: newNotification.channels.filter((c) => c !== channel),
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={channel} className="capitalize">
                          {channel.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNotification}
                    disabled={!newNotification.title || !newNotification.message}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cadastre">Cadastre</SelectItem>
                    <SelectItem value="Concessions">Concessions</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Validation">Validation</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterType("all")
                    setFilterCategory("all")
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${
                      notification.status === "unread" ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(notification.type)}
                          <h4 className="font-medium">{notification.title}</h4>
                          {getTypeBadge(notification.type)}
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="outline">{notification.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{notification.createdAt}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{notification.recipients.length} recipients</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {notification.channels.map((channel) => (
                              <span key={channel} className="flex items-center">
                                {getChannelIcon(channel)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.status === "unread" && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedNotification(notification)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteNotification(notification.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Pre-configured notification templates for common scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Variables</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>{getTypeBadge(template.type)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {template.channels.map((channel) => (
                              <span key={channel}>{getChannelIcon(channel)}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure global notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Server</Label>
                    <Input defaultValue="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input defaultValue="noreply@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input defaultValue="NBC LandSight System" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">SMS Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMS Provider</Label>
                    <Select defaultValue="twilio">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo</SelectItem>
                        <SelectItem value="local">Local Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>From Number</Label>
                    <Input defaultValue="+231-555-0123" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Default Recipients</h4>
                <div className="space-y-2">
                  <Label>System Administrators</Label>
                  <Textarea
                    defaultValue="admin@example.com, sysadmin@example.com"
                    placeholder="Comma-separated email addresses"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Security Team</Label>
                  <Textarea
                    defaultValue="security@example.com, incident@example.com"
                    placeholder="Comma-separated email addresses"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Rules</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Push Notifications</Label>
                      <p className="text-sm text-gray-600">Browser push notifications</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-archive Read Notifications</Label>
                      <p className="text-sm text-gray-600">Automatically archive notifications after 30 days</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
