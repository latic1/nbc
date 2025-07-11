"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
  Loader2,
  Calendar,
  User,
  Globe,
} from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  category: string
  message: string
  userId?: string
  userName?: string
  ipAddress: string
  details?: any
  created_at?: string
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const logsPerPage = 20

  useEffect(() => {
    loadLogs()
  }, [currentPage, levelFilter, categoryFilter, searchTerm])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const filters: any = {}

      if (levelFilter !== "all") filters.level = levelFilter
      if (categoryFilter !== "all") filters.category = categoryFilter
      if (searchTerm) filters.search = searchTerm

      const data = await DatabaseService.getLogs(filters)
      setLogs(data)
      setTotalLogs(data.length)
    } catch (error) {
      console.error("Failed to load logs:", error)
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "debug":
        return <Bug className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case "debug":
        return <Badge className="bg-gray-100 text-gray-800">Debug</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Authentication: "bg-purple-100 text-purple-800",
      Cadastre: "bg-green-100 text-green-800",
      Concessions: "bg-orange-100 text-orange-800",
      GIS: "bg-blue-100 text-blue-800",
      System: "bg-red-100 text-red-800",
      Reports: "bg-indigo-100 text-indigo-800",
      Validation: "bg-yellow-100 text-yellow-800",
      Administration: "bg-pink-100 text-pink-800",
    }

    return <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvHeaders = ["ID", "Timestamp", "Level", "Category", "Message", "User", "IP Address"]
      const csvRows = logs.map((log) => [
        log.id,
        log.timestamp,
        log.level,
        log.category,
        log.message.replace(/,/g, ";"), // Replace commas to avoid CSV issues
        log.userName || "System",
        log.ipAddress,
      ])

      const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Logs exported successfully",
      })

      // Log the export action
      await DatabaseService.createLog({
        level: "info",
        category: "System",
        message: "System logs exported",
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
      })
    } catch (error) {
      console.error("Failed to export logs:", error)
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      })
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(totalLogs / logsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
          <p className="text-gray-600">Monitor system activities and troubleshoot issues</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Cadastre">Cadastre</SelectItem>
                <SelectItem value="Concessions">Concessions</SelectItem>
                <SelectItem value="GIS">GIS</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Reports">Reports</SelectItem>
                <SelectItem value="Validation">Validation</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setLevelFilter("all")
                setCategoryFilter("all")
                setCurrentPage(1)
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Logs ({totalLogs})</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading logs...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{log.timestamp}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(log.category)}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{log.message}</p>
                        </TableCell>
                        <TableCell>
                          {log.userName ? (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{log.userName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm">{log.ipAddress}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * logsPerPage + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of{" "}
                    {totalLogs} logs
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>Complete information for log entry {selectedLog?.id}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Log ID</label>
                  <p className="text-sm text-gray-600">{selectedLog.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm text-gray-600">{selectedLog.timestamp}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <div>{getLevelBadge(selectedLog.level)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <div>{getCategoryBadge(selectedLog.category)}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-gray-600">{selectedLog.userName || "System"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm text-gray-600 font-mono">{selectedLog.ipAddress}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <p className="text-sm text-gray-600">{selectedLog.message}</p>
              </div>
              {selectedLog.details && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Details</label>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {typeof selectedLog.details === "string"
                      ? selectedLog.details
                      : JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
