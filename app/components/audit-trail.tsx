"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  category: "boundary" | "metadata" | "validation" | "document" | "status"
  description: string
  oldValue?: string
  newValue?: string
  ipAddress: string
  userAgent: string
  severity: "low" | "medium" | "high"
}

export function AuditTrail({ parcelId }: { parcelId: string }) {
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterUser, setFilterUser] = useState("")
  const [dateRange, setDateRange] = useState("30")

  const auditEntries: AuditEntry[] = [
    {
      id: "audit_001",
      timestamp: "2024-01-25 14:30:22",
      user: "john.surveyor@example.com",
      action: "Boundary Modified",
      category: "boundary",
      description: "Updated northern boundary coordinates",
      oldValue: "6.8319°N, 9.3658°W",
      newValue: "6.8320°N, 9.3658°W",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "high",
    },
    {
      id: "audit_002",
      timestamp: "2024-01-25 14:25:15",
      user: "mary.admin@example.com",
      action: "Validation Run",
      category: "validation",
      description: "Spatial validation completed with 2 warnings",
      ipAddress: "192.168.1.23",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
    },
    {
      id: "audit_003",
      timestamp: "2024-01-25 13:45:08",
      user: "system@example.com",
      action: "Status Changed",
      category: "status",
      description: "Parcel status updated from 'Draft' to 'Under Review'",
      oldValue: "Draft",
      newValue: "Under Review",
      ipAddress: "127.0.0.1",
      userAgent: "System Process",
      severity: "medium",
    },
    {
      id: "audit_004",
      timestamp: "2024-01-25 11:20:33",
      user: "james.clerk@example.com",
      action: "Document Uploaded",
      category: "document",
      description: "Survey report uploaded (survey_report_2024.pdf)",
      ipAddress: "192.168.1.67",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "low",
    },
    {
      id: "audit_005",
      timestamp: "2024-01-25 10:15:44",
      user: "john.surveyor@example.com",
      action: "Metadata Updated",
      category: "metadata",
      description: "Owner information updated",
      oldValue: "John Doe",
      newValue: "John Doe Farms Ltd.",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "low",
    },
    {
      id: "audit_006",
      timestamp: "2024-01-24 16:30:12",
      user: "john.surveyor@example.com",
      action: "Parcel Created",
      category: "metadata",
      description: "Initial parcel registration created",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "high",
    },
  ]

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
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const filteredEntries = auditEntries.filter((entry) => {
    if (filterCategory !== "all" && entry.category !== filterCategory) return false
    if (filterUser && !entry.user.toLowerCase().includes(filterUser.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Audit Trail - {parcelId}</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Complete history of all changes and activities</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Filter by user..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="boundary">Boundary Changes</SelectItem>
                <SelectItem value="metadata">Metadata Updates</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="status">Status Changes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
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

          {/* Audit Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Severity</TableHead>
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
                      <div className="text-xs text-gray-500">{entry.description}</div>
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
                    {entry.oldValue && entry.newValue ? (
                      <div className="text-xs">
                        <div className="text-red-600">- {entry.oldValue}</div>
                        <div className="text-green-600">+ {entry.newValue}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getSeverityBadge(entry.severity)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
