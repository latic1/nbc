"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  History,
  User,
  MapPin,
  Edit,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Eye,
  Search,
  Activity,
  Database,
  Shield,
} from "lucide-react"

interface EnhancedAuditEntry {
  id: string
  timestamp: string
  user: string
  userId: string
  action: string
  category: "boundary" | "metadata" | "validation" | "document" | "status" | "user" | "system" | "security"
  description: string
  entityType: string
  entityId: string
  oldValue?: any
  newValue?: any
  ipAddress: string
  userAgent: string
  sessionId: string
  severity: "low" | "medium" | "high" | "critical"
  compliance: boolean
  tags: string[]
  metadata: any
}

export function EnhancedAuditTrail({ entityId, entityType }: { entityId?: string; entityType?: string }) {
  const [auditEntries, setAuditEntries] = useState<EnhancedAuditEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<EnhancedAuditEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<EnhancedAuditEntry | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateRange, setDateRange] = useState("30")
  const [complianceFilter, setComplianceFilter] = useState("all")

  // Mock enhanced audit data
  useEffect(() => {
    const mockEntries: EnhancedAuditEntry[] = [
      {
        id: "audit_001",
        timestamp: "2024-01-25 14:30:22",
        user: "john.surveyor@nbc.gov.lr",
        userId: "USR-001",
        action: "Boundary Modified",
        category: "boundary",
        description: "Updated northern boundary coordinates for parcel PAR-2024-001",
        entityType: "parcel",
        entityId: "PAR-2024-001",
        oldValue: { coordinates: "6.8319°N, 9.3658°W" },
        newValue: { coordinates: "6.8320°N, 9.3658°W" },
        ipAddress: "192.168.1.45",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        sessionId: "sess_abc123",
        severity: "high",
        compliance: true,
        tags: ["spatial", "boundary", "coordinates"],
        metadata: {
          reason: "Survey correction",
          approvedBy: "mary.admin@nbc.gov.lr",
          validationPassed: true,
        },
      },
      {
        id: "audit_002",
        timestamp: "2024-01-25 14:25:15",
        user: "mary.admin@nbc.gov.lr",
        userId: "USR-002",
        action: "User Created",
        category: "user",
        description: "Created new user account for James Clerk",
        entityType: "user",
        entityId: "USR-003",
        oldValue: null,
        newValue: {
          email: "james.clerk@nbc.gov.lr",
          role: "Data Entry Clerk",
          department: "Cadastre Division",
        },
        ipAddress: "192.168.1.23",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        sessionId: "sess_def456",
        severity: "medium",
        compliance: true,
        tags: ["user-management", "account-creation"],
        metadata: {
          permissions: ["cadastre.view", "cadastre.create"],
          temporaryPassword: true,
        },
      },
      {
        id: "audit_003",
        timestamp: "2024-01-25 13:45:08",
        user: "system@nbc.gov.lr",
        userId: "SYSTEM",
        action: "Automated Backup",
        category: "system",
        description: "Daily database backup completed successfully",
        entityType: "database",
        entityId: "cadastre_db",
        oldValue: null,
        newValue: {
          backupSize: "2.3GB",
          backupLocation: "/backups/2024-01-25/",
          checksum: "sha256:abc123...",
        },
        ipAddress: "127.0.0.1",
        userAgent: "System Process",
        sessionId: "sys_backup_001",
        severity: "low",
        compliance: true,
        tags: ["backup", "automated", "database"],
        metadata: {
          duration: "45 minutes",
          compression: "gzip",
          encrypted: true,
        },
      },
      {
        id: "audit_004",
        timestamp: "2024-01-25 11:20:33",
        user: "unknown@external.com",
        userId: "UNKNOWN",
        action: "Failed Login Attempt",
        category: "security",
        description: "Multiple failed login attempts detected",
        entityType: "authentication",
        entityId: "login_attempt_001",
        oldValue: null,
        newValue: {
          attempts: 5,
          lastAttempt: "2024-01-25 11:20:33",
          blocked: true,
        },
        ipAddress: "203.45.67.89",
        userAgent: "Mozilla/5.0 (Unknown)",
        sessionId: "failed_session",
        severity: "critical",
        compliance: false,
        tags: ["security", "failed-login", "suspicious"],
        metadata: {
          country: "Unknown",
          blocked: true,
          alertSent: true,
        },
      },
      {
        id: "audit_005",
        timestamp: "2024-01-25 10:15:44",
        user: "john.surveyor@nbc.gov.lr",
        userId: "USR-001",
        action: "Document Uploaded",
        category: "document",
        description: "Survey report uploaded for parcel PAR-2024-001",
        entityType: "document",
        entityId: "DOC-2024-001",
        oldValue: null,
        newValue: {
          filename: "survey_report_2024.pdf",
          size: "2.5MB",
          type: "application/pdf",
        },
        ipAddress: "192.168.1.45",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        sessionId: "sess_abc123",
        severity: "low",
        compliance: true,
        tags: ["document", "upload", "survey"],
        metadata: {
          virusScanned: true,
          approved: false,
          reviewRequired: true,
        },
      },
      {
        id: "audit_006",
        timestamp: "2024-01-24 16:30:12",
        user: "data.processor@nbc.gov.lr",
        userId: "USR-004",
        action: "Bulk Data Import",
        category: "system",
        description: "Imported 150 parcel records from external system",
        entityType: "bulk_operation",
        entityId: "BULK-2024-001",
        oldValue: { recordCount: 0 },
        newValue: { recordCount: 150 },
        ipAddress: "192.168.1.78",
        userAgent: "Data Import Tool v2.1",
        sessionId: "bulk_import_001",
        severity: "high",
        compliance: true,
        tags: ["bulk-import", "data-migration", "parcels"],
        metadata: {
          source: "Legacy System",
          validationErrors: 3,
          successRate: "98%",
        },
      },
    ]

    setAuditEntries(mockEntries)
    setFilteredEntries(mockEntries)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = auditEntries

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.entityId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((entry) => entry.category === categoryFilter)
    }

    if (userFilter) {
      filtered = filtered.filter((entry) => entry.user.toLowerCase().includes(userFilter.toLowerCase()))
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((entry) => entry.severity === severityFilter)
    }

    if (complianceFilter !== "all") {
      const isCompliant = complianceFilter === "compliant"
      filtered = filtered.filter((entry) => entry.compliance === isCompliant)
    }

    if (entityId) {
      filtered = filtered.filter((entry) => entry.entityId === entityId)
    }

    if (entityType) {
      filtered = filtered.filter((entry) => entry.entityType === entityType)
    }

    setFilteredEntries(filtered)
  }, [searchTerm, categoryFilter, userFilter, severityFilter, complianceFilter, entityId, entityType, auditEntries])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "boundary":
        return <MapPin className="h-4 w-4 text-blue-600" />
      case "metadata":
        return <Edit className="h-4 w-4 text-green-600" />
      case "validation":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "document":
        return <FileText className="h-4 w-4 text-purple-600" />
      case "status":
        return <CheckCircle className="h-4 w-4 text-orange-600" />
      case "user":
        return <User className="h-4 w-4 text-indigo-600" />
      case "system":
        return <Database className="h-4 w-4 text-gray-600" />
      case "security":
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getComplianceBadge = (compliance: boolean) => {
    return compliance ? (
      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>
    )
  }

  const exportAuditLog = () => {
    // In a real application, this would generate and download a comprehensive audit report
    alert("Audit log export functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <History className="h-6 w-6" />
            <span>Enhanced Audit Trail</span>
          </h2>
          <p className="text-gray-600">
            Comprehensive activity logging with compliance tracking and detailed forensics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportAuditLog}>
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search audit entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="boundary">Boundary Changes</SelectItem>
                    <SelectItem value="metadata">Metadata Updates</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="status">Status Changes</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="system">System Events</SelectItem>
                    <SelectItem value="security">Security Events</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by user..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Timeline ({filteredEntries.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">{entry.timestamp.split(" ")[0]}</div>
                              <div className="text-xs text-gray-500">{entry.timestamp.split(" ")[1]}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">{entry.user.split("@")[0]}</div>
                              <div className="text-xs text-gray-500">{entry.ipAddress}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{entry.action}</div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">{entry.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(entry.category)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{entry.entityType}</div>
                            <div className="text-xs text-gray-500">{entry.entityId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getSeverityBadge(entry.severity)}</TableCell>
                        <TableCell>{getComplianceBadge(entry.compliance)}</TableCell>
                        <TableCell>
                          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Audit Entry Details</DialogTitle>
                                <DialogDescription>
                                  Complete forensic information for audit entry {selectedEntry?.id}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedEntry && (
                                <div className="space-y-6">
                                  {/* Basic Information */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Entry ID</label>
                                      <p className="text-sm text-gray-600">{selectedEntry.id}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Timestamp</label>
                                      <p className="text-sm text-gray-600">{selectedEntry.timestamp}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">User</label>
                                      <p className="text-sm text-gray-600">{selectedEntry.user}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Session ID</label>
                                      <p className="text-sm text-gray-600 font-mono">{selectedEntry.sessionId}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">IP Address</label>
                                      <p className="text-sm text-gray-600 font-mono">{selectedEntry.ipAddress}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Severity</label>
                                      <div>{getSeverityBadge(selectedEntry.severity)}</div>
                                    </div>
                                  </div>

                                  {/* Action Details */}
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Action Description</label>
                                    <p className="text-sm text-gray-600">{selectedEntry.description}</p>
                                  </div>

                                  {/* Entity Information */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Entity Type</label>
                                      <p className="text-sm text-gray-600">{selectedEntry.entityType}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Entity ID</label>
                                      <p className="text-sm text-gray-600">{selectedEntry.entityId}</p>
                                    </div>
                                  </div>

                                  {/* Data Changes */}
                                  {(selectedEntry.oldValue || selectedEntry.newValue) && (
                                    <div className="space-y-4">
                                      <label className="text-sm font-medium">Data Changes</label>
                                      <div className="grid grid-cols-2 gap-4">
                                        {selectedEntry.oldValue && (
                                          <div className="space-y-2">
                                            <label className="text-xs font-medium text-red-600">Old Value</label>
                                            <pre className="text-xs bg-red-50 p-3 rounded overflow-x-auto">
                                              {JSON.stringify(selectedEntry.oldValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {selectedEntry.newValue && (
                                          <div className="space-y-2">
                                            <label className="text-xs font-medium text-green-600">New Value</label>
                                            <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto">
                                              {JSON.stringify(selectedEntry.newValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tags */}
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedEntry.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Additional Metadata</label>
                                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                                    </pre>
                                  </div>

                                  {/* Technical Details */}
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">User Agent</label>
                                    <p className="text-xs text-gray-600 font-mono break-all">
                                      {selectedEntry.userAgent}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{filteredEntries.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {filteredEntries.filter((e) => e.severity === "critical").length}
                </div>
                <div className="text-sm text-gray-600">Critical Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {filteredEntries.filter((e) => e.compliance).length}
                </div>
                <div className="text-sm text-gray-600">Compliant Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(filteredEntries.map((e) => e.userId)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Users</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>Monitor compliance status and identify potential issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Compliance Rate by Category</h4>
                    {["boundary", "metadata", "validation", "document", "status", "user", "system", "security"].map(
                      (category) => {
                        const categoryEntries = filteredEntries.filter((e) => e.category === category)
                        const compliantEntries = categoryEntries.filter((e) => e.compliance)
                        const rate =
                          categoryEntries.length > 0 ? (compliantEntries.length / categoryEntries.length) * 100 : 0

                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(category)}
                              <span className="text-sm capitalize">{category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Non-Compliant Events</h4>
                    <div className="space-y-2">
                      {filteredEntries
                        .filter((e) => !e.compliance)
                        .slice(0, 5)
                        .map((entry) => (
                          <div key={entry.id} className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{entry.action}</p>
                                <p className="text-xs text-gray-600">{entry.timestamp}</p>
                              </div>
                              {getSeverityBadge(entry.severity)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
