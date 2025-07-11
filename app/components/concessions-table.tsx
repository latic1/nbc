"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import {
  Eye,
  Edit,
  DollarSign,
  Search,
  Building,
  Pickaxe,
  Trees,
  Wheat,
  Loader2,
  Plus,
  Trash2,
  Save,
} from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface Concession {
  id: string
  name: string
  type: string
  company: string
  county: string
  area: string
  status: string
  issued: string
  expires: string
  revenue: string
  compliance: string
  created_at?: string
  updated_at?: string
}

export function ConcessionsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [concessions, setConcessions] = useState<Concession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedConcession, setSelectedConcession] = useState<Concession | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    company: "",
    county: "",
    area: "",
    status: "",
    issued: "",
    expires: "",
    revenue: "",
    compliance: "",
  })

  const concessionTypes = ["Mining", "Forestry", "Agriculture", "Oil & Gas", "Infrastructure"]
  const counties = [
    "Bomi",
    "Bong",
    "Gbarpolu",
    "Grand Bassa",
    "Grand Cape Mount",
    "Grand Gedeh",
    "Grand Kru",
    "Lofa",
    "Margibi",
    "Maryland",
    "Montserrado",
    "Nimba",
    "River Cess",
    "River Gee",
    "Sinoe",
  ]
  const statusOptions = ["Active", "Application", "Under Review", "Renewal Pending", "Suspended", "Expired"]
  const complianceOptions = ["Excellent", "Good", "Fair", "Poor"]

  useEffect(() => {
    loadConcessions()
  }, [])

  const loadConcessions = async () => {
    try {
      setIsLoading(true)
      const data = await DatabaseService.getConcessions()
      setConcessions(data)
    } catch (error) {
      console.error("Failed to load concessions:", error)
      toast({
        title: "Error",
        description: "Failed to load concessions from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateConcession = async () => {
    try {
      if (!formData.name || !formData.company || !formData.type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const newId = await DatabaseService.createConcession(formData)

      await DatabaseService.createLog({
        level: "info",
        category: "Concessions",
        message: `New concession created: ${formData.name}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ concessionId: newId, ...formData }),
      })

      toast({
        title: "Success",
        description: "Concession created successfully",
      })

      setIsCreateDialogOpen(false)
      resetForm()
      loadConcessions()
    } catch (error) {
      console.error("Failed to create concession:", error)
      toast({
        title: "Error",
        description: "Failed to create concession",
        variant: "destructive",
      })
    }
  }

  const handleEditConcession = async () => {
    try {
      if (!selectedConcession || !formData.name || !formData.company || !formData.type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      await DatabaseService.updateConcession(selectedConcession.id, formData)

      await DatabaseService.createLog({
        level: "info",
        category: "Concessions",
        message: `Concession updated: ${formData.name}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ concessionId: selectedConcession.id, changes: formData }),
      })

      toast({
        title: "Success",
        description: "Concession updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedConcession(null)
      resetForm()
      loadConcessions()
    } catch (error) {
      console.error("Failed to update concession:", error)
      toast({
        title: "Error",
        description: "Failed to update concession",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConcession = async (concession: Concession) => {
    try {
      await DatabaseService.deleteConcession(concession.id)

      await DatabaseService.createLog({
        level: "warning",
        category: "Concessions",
        message: `Concession deleted: ${concession.name}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ concessionId: concession.id, name: concession.name }),
      })

      toast({
        title: "Success",
        description: "Concession deleted successfully",
      })

      loadConcessions()
    } catch (error) {
      console.error("Failed to delete concession:", error)
      toast({
        title: "Error",
        description: "Failed to delete concession",
        variant: "destructive",
      })
    }
  }

  const handleViewConcession = async (concession: Concession) => {
    try {
      const latestData = await DatabaseService.getConcessionById(concession.id)

      await DatabaseService.createLog({
        level: "info",
        category: "Concessions",
        message: `Viewed concession details: ${concession.name}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
      })

      toast({
        title: "Concession Details",
        description: `Viewing details for ${concession.name}`,
      })
    } catch (error) {
      console.error("Failed to view concession:", error)
      toast({
        title: "Error",
        description: "Failed to load concession details",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (concession: Concession) => {
    setSelectedConcession(concession)
    setFormData({
      name: concession.name,
      type: concession.type,
      company: concession.company,
      county: concession.county,
      area: concession.area,
      status: concession.status,
      issued: concession.issued,
      expires: concession.expires,
      revenue: concession.revenue,
      compliance: concession.compliance,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      company: "",
      county: "",
      area: "",
      status: "",
      issued: "",
      expires: "",
      revenue: "",
      compliance: "",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Application":
        return <Badge className="bg-blue-100 text-blue-800">Application</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
      case "Renewal Pending":
        return <Badge className="bg-orange-100 text-orange-800">Renewal Pending</Badge>
      case "Suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "Expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case "Excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "Good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "Fair":
        return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
      case "Poor":
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Mining":
        return <Pickaxe className="h-4 w-4" />
      case "Forestry":
        return <Trees className="h-4 w-4" />
      case "Agriculture":
        return <Wheat className="h-4 w-4" />
      case "Oil & Gas":
        return <Building className="h-4 w-4" />
      default:
        return <Building className="h-4 w-4" />
    }
  }

  const filteredConcessions = concessions.filter(
    (concession) =>
      concession.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.county.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading concessions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Concessions Management</h2>
          <p className="text-gray-600">Manage mining, forestry, and other concessions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Concession
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Concession</DialogTitle>
              <DialogDescription>Add a new concession to the registry</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Concession Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter concession name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {concessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select value={formData.county} onValueChange={(value) => setFormData({ ...formData, county: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., 2,450 ha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issued">Issue Date</Label>
                <Input
                  id="issued"
                  type="date"
                  value={formData.issued}
                  onChange={(e) => setFormData({ ...formData, issued: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expiry Date</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires}
                  onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="e.g., $2.5M"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance">Compliance</Label>
                <Select
                  value={formData.compliance}
                  onValueChange={(value) => setFormData({ ...formData, compliance: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceOptions.map((compliance) => (
                      <SelectItem key={compliance} value={compliance}>
                        {compliance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConcession}>
                <Save className="h-4 w-4 mr-2" />
                Create Concession
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by concession ID, name, company, or county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadConcessions} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Concessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Concessions Registry ({filteredConcessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concession</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location & Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConcessions.map((concession) => (
                <TableRow key={concession.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{concession.name}</div>
                      <div className="text-sm text-gray-500">{concession.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(concession.type)}
                      <Badge variant="outline">{concession.type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{concession.company}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{concession.county}</div>
                      <div className="text-sm text-gray-500">{concession.area}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(concession.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {concession.issued !== "-" ? (
                        <>
                          <div>Issued: {concession.issued}</div>
                          <div>Expires: {concession.expires}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{concession.revenue}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getComplianceBadge(concession.compliance)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewConcession(concession)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(concession)}>
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
                            <AlertDialogTitle>Delete Concession</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{concession.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteConcession(concession)}>
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Concession</DialogTitle>
            <DialogDescription>Update concession information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Concession Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter concession name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company *</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {concessionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-county">County</Label>
              <Select value={formData.county} onValueChange={(value) => setFormData({ ...formData, county: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area">Area</Label>
              <Input
                id="edit-area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 2,450 ha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-issued">Issue Date</Label>
              <Input
                id="edit-issued"
                type="date"
                value={formData.issued}
                onChange={(e) => setFormData({ ...formData, issued: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expires">Expiry Date</Label>
              <Input
                id="edit-expires"
                type="date"
                value={formData.expires}
                onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-revenue">Revenue</Label>
              <Input
                id="edit-revenue"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                placeholder="e.g., $2.5M"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-compliance">Compliance</Label>
              <Select
                value={formData.compliance}
                onValueChange={(value) => setFormData({ ...formData, compliance: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select compliance" />
                </SelectTrigger>
                <SelectContent>
                  {complianceOptions.map((compliance) => (
                    <SelectItem key={compliance} value={compliance}>
                      {compliance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditConcession}>
              <Save className="h-4 w-4 mr-2" />
              Update Concession
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
