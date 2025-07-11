"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Key,
  Plus,
  BarChart3,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Activity,
  Clock,
  Users,
  FileText,
  Download,
  Loader2,
} from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface ApiKey {
  id: string
  name: string
  key: string
  institution: string
  permissions: string[]
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastUsed: string
  requestCount: number
  rateLimit: number
  expiresAt?: string
}

interface ApiEndpoint {
  path: string
  method: string
  description: string
  permissions: string[]
  rateLimit: number
  status: "active" | "deprecated"
}

export function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    institution: "",
    permissions: [] as string[],
    rateLimit: 1000,
    expiresAt: "",
  })

  const [endpoints] = useState<ApiEndpoint[]>([
    {
      path: "/api/v1/cadastre/parcels",
      method: "GET",
      description: "Retrieve cadastral parcel information",
      permissions: ["read:cadastre"],
      rateLimit: 100,
      status: "active",
    },
    {
      path: "/api/v1/concessions",
      method: "GET",
      description: "Get concession data with filtering options",
      permissions: ["read:concessions"],
      rateLimit: 50,
      status: "active",
    },
    {
      path: "/api/v1/public/statistics",
      method: "GET",
      description: "Public statistics and summary data",
      permissions: ["read:public_data"],
      rateLimit: 200,
      status: "active",
    },
    {
      path: "/api/v1/reports/revenue",
      method: "GET",
      description: "Revenue reports and analytics",
      permissions: ["read:reports"],
      rateLimit: 25,
      status: "active",
    },
    {
      path: "/api/v1/spatial/boundaries",
      method: "GET",
      description: "Administrative boundary data",
      permissions: ["read:spatial"],
      rateLimit: 75,
      status: "active",
    },
  ])

  const availablePermissions = [
    { id: "read:cadastre", label: "Read Cadastre Data", description: "Access to parcel and land registry data" },
    { id: "read:concessions", label: "Read Concessions", description: "Access to concession information" },
    { id: "read:public_data", label: "Read Public Data", description: "Access to publicly available datasets" },
    { id: "read:reports", label: "Read Reports", description: "Access to generated reports and analytics" },
    { id: "read:spatial", label: "Read Spatial Data", description: "Access to GIS and mapping data" },
    { id: "write:cadastre", label: "Write Cadastre Data", description: "Create and update cadastral records" },
    { id: "admin:system", label: "System Administration", description: "Full system access (restricted)" },
  ]

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      const data = await DatabaseService.getApiKeys()
      setApiKeys(data)
    } catch (error) {
      console.error("Failed to load API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateApiKey = () => {
    return `nbc_live_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  }

  const handleCreateApiKey = async () => {
    try {
      if (!newApiKey.name || !newApiKey.institution || newApiKey.permissions.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields and select at least one permission",
          variant: "destructive",
        })
        return
      }

      const apiKeyData = {
        name: newApiKey.name,
        key: generateApiKey(),
        institution: newApiKey.institution,
        permissions: newApiKey.permissions,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        lastUsed: "Never",
        requestCount: 0,
        rateLimit: newApiKey.rateLimit,
        expiresAt: newApiKey.expiresAt || undefined,
      }

      await DatabaseService.createApiKey(apiKeyData)

      await DatabaseService.createLog({
        level: "info",
        category: "API Management",
        message: `New API key created for ${newApiKey.institution}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ name: newApiKey.name, institution: newApiKey.institution }),
      })

      toast({
        title: "Success",
        description: "API key created successfully",
      })

      setNewApiKey({
        name: "",
        institution: "",
        permissions: [],
        rateLimit: 1000,
        expiresAt: "",
      })
      setIsCreateDialogOpen(false)
      loadApiKeys()
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      })
    }
  }

  const handleDeleteApiKey = async (id: string, name: string) => {
    try {
      await DatabaseService.deleteApiKey(id)

      await DatabaseService.createLog({
        level: "warning",
        category: "API Management",
        message: `API key deleted: ${name}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ apiKeyId: id, name }),
      })

      toast({
        title: "Success",
        description: "API key deleted successfully",
      })

      loadApiKeys()
    } catch (error) {
      console.error("Failed to delete API key:", error)
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await DatabaseService.updateApiKey(id, { status: newStatus })

      await DatabaseService.createLog({
        level: "info",
        category: "API Management",
        message: `API key status changed to ${newStatus}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ apiKeyId: id, newStatus }),
      })

      toast({
        title: "Success",
        description: `API key ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      })

      loadApiKeys()
    } catch (error) {
      console.error("Failed to toggle API key status:", error)
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{method}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading API management...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Management</h2>
          <p className="text-gray-600">Manage external access to NBC LandSight data and services</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>Generate a new API key for external institution access</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">API Key Name *</Label>
                  <Input
                    id="keyName"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                    placeholder="e.g., Ministry of Finance API Access"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    value={newApiKey.institution}
                    onChange={(e) => setNewApiKey({ ...newApiKey, institution: e.target.value })}
                    placeholder="e.g., Ministry of Finance"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissions *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={newApiKey.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: [...newApiKey.permissions, permission.id],
                            })
                          } else {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: newApiKey.permissions.filter((p) => p !== permission.id),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={newApiKey.rateLimit}
                    onChange={(e) => setNewApiKey({ ...newApiKey, rateLimit: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newApiKey.expiresAt}
                    onChange={(e) => setNewApiKey({ ...newApiKey, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateApiKey} disabled={!newApiKey.name || !newApiKey.institution}>
                  Create API Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Keys ({apiKeys.length})</span>
              </CardTitle>
              <CardDescription>Manage API keys for external institutions and partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>{apiKey.institution}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {showApiKey === apiKey.id ? apiKey.key : `${apiKey.key.substring(0, 20)}...`}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                            >
                              {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.slice(0, 2).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.split(":")[1]}
                              </Badge>
                            ))}
                            {apiKey.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{apiKey.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{apiKey.requestCount.toLocaleString()} requests</div>
                            <div className="text-gray-500">{apiKey.rateLimit}/hour limit</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{apiKey.lastUsed}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={apiKey.status === "active"}
                              onCheckedChange={() => handleToggleStatus(apiKey.id, apiKey.status)}
                            />
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the API key and revoke
                                    access for {apiKey.institution}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteApiKey(apiKey.id, apiKey.name)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>API Endpoints</span>
              </CardTitle>
              <CardDescription>Available API endpoints and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Required Permissions</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                        </TableCell>
                        <TableCell>{getMethodBadge(endpoint.method)}</TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {endpoint.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{endpoint.rateLimit}/hour</TableCell>
                        <TableCell>{getStatusBadge(endpoint.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeys.length}</div>
                <p className="text-xs text-muted-foreground">
                  {apiKeys.filter((k) => k.status === "active").length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiKeys.reduce((sum, key) => sum + key.requestCount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Institutions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(apiKeys.map((k) => k.institution)).size}</div>
                <p className="text-xs text-muted-foreground">Across government & NGOs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245ms</div>
                <p className="text-xs text-muted-foreground">-5ms from last week</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Usage Analytics</CardTitle>
              <CardDescription>Request patterns and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">API usage charts would be displayed here</p>
                  <p className="text-sm text-gray-500">Integration with analytics service required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>API Documentation</span>
              </CardTitle>
              <CardDescription>Complete API reference and integration guides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Getting Started</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 mb-2">Include your API key in the Authorization header:</p>
                  <code className="block bg-gray-800 text-white p-2 rounded text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <code className="block bg-gray-800 text-white p-2 rounded text-sm">https://api.nbc.gov.lr/v1</code>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <code className="block bg-gray-800 text-white p-2 rounded text-sm whitespace-pre">
                    {`curl -X GET "https://api.nbc.gov.lr/v1/cadastre/parcels" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`}
                  </code>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Response Format</h4>
                  <code className="block bg-gray-800 text-white p-2 rounded text-sm whitespace-pre">
                    {`{
"success": true,
"data": [...],
"pagination": {
  "page": 1,
  "limit": 50,
  "total": 1250
}
}`}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Endpoints</h3>
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getMethodBadge(endpoint.method)}
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Rate limit: {endpoint.rateLimit}/hour</span>
                      <span>Permissions: {endpoint.permissions.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download OpenAPI Spec
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
