"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Map, Search, Eye, MapPin, Download, Globe, Info } from "lucide-react"

interface PublicConcession {
  id: string
  name: string
  company: string
  type: string
  county: string
  district: string
  area: string
  status: string
  issueDate: string
  expiryDate: string
  duration: string
  description: string
  coordinates: string
  revenue?: string
  contactInfo?: string
}

export default function PublicPortalPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [countyFilter, setCountyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConcession, setSelectedConcession] = useState<PublicConcession | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const publicConcessions: PublicConcession[] = [
    {
      id: "CON-2024-001",
      name: "Bong Mining Concession",
      company: "Liberia Gold Mining Ltd.",
      type: "Mining",
      county: "Bong",
      district: "Jorquelleh",
      area: "2,450 ha",
      status: "Active",
      issueDate: "2020-03-15",
      expiryDate: "2030-03-15",
      duration: "10 years",
      description: "Gold mining operations in Bong County with environmental compliance measures.",
      coordinates: "6.8319°N, 9.3658°W",
      revenue: "$2.5M annually",
      contactInfo: "info@liberiagoId.com",
    },
    {
      id: "CON-2024-002",
      name: "Nimba Forest Concession",
      company: "Sustainable Timber Corp",
      type: "Forestry",
      county: "Nimba",
      district: "Sanniquellie-Mahn",
      area: "15,680 ha",
      status: "Active",
      issueDate: "2019-08-22",
      expiryDate: "2034-08-22",
      duration: "15 years",
      description: "Sustainable forestry operations with reforestation commitments.",
      coordinates: "7.3622°N, 8.7167°W",
      revenue: "$1.8M annually",
      contactInfo: "contact@sustainabletimber.lr",
    },
    {
      id: "CON-2024-003",
      name: "Grand Bassa Oil Block",
      company: "Atlantic Energy Partners",
      type: "Oil & Gas",
      county: "Grand Bassa",
      district: "Buchanan",
      area: "45,200 ha",
      status: "Under Review",
      issueDate: "-",
      expiryDate: "-",
      duration: "25 years (proposed)",
      description: "Offshore oil exploration and production concession application.",
      coordinates: "5.8808°N, 10.0467°W",
      contactInfo: "applications@atlanticenergy.com",
    },
    {
      id: "CON-2024-004",
      name: "Lofa Agricultural Zone",
      company: "Northern Agro Development",
      type: "Agriculture",
      county: "Lofa",
      district: "Voinjama",
      area: "8,750 ha",
      status: "Active",
      issueDate: "2021-11-10",
      expiryDate: "2041-11-10",
      duration: "20 years",
      description: "Large-scale agricultural development for food security and export.",
      coordinates: "8.4219°N, 9.7539°W",
      revenue: "$950K annually",
      contactInfo: "info@northernagro.lr",
    },
    {
      id: "CON-2024-005",
      name: "Sinoe Rubber Plantation",
      company: "Liberia Rubber Industries",
      type: "Agriculture",
      county: "Sinoe",
      district: "Greenville",
      area: "12,300 ha",
      status: "Renewal Pending",
      issueDate: "2014-05-18",
      expiryDate: "2024-05-18",
      duration: "10 years",
      description: "Rubber plantation operations with community development programs.",
      coordinates: "5.0114°N, 9.0417°W",
      revenue: "$3.2M annually",
      contactInfo: "operations@liberiarubber.com",
    },
    {
      id: "CON-2024-006",
      name: "Maryland Palm Oil Concession",
      company: "West Africa Palm Ltd.",
      type: "Agriculture",
      county: "Maryland",
      district: "Harper",
      area: "6,800 ha",
      status: "Active",
      issueDate: "2022-01-20",
      expiryDate: "2047-01-20",
      duration: "25 years",
      description: "Sustainable palm oil production with zero deforestation commitment.",
      coordinates: "4.3750°N, 7.7167°W",
      revenue: "$1.2M annually",
      contactInfo: "sustainability@wapalm.lr",
    },
  ]

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

  const concessionTypes = ["Mining", "Forestry", "Oil & Gas", "Agriculture"]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case "Renewal Pending":
        return <Badge className="bg-orange-100 text-orange-800">Renewal Pending</Badge>
      case "Suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Mining":
        return "⛏️"
      case "Forestry":
        return "🌲"
      case "Agriculture":
        return "🌾"
      case "Oil & Gas":
        return "🛢️"
      default:
        return "🏢"
    }
  }

  const filteredConcessions = publicConcessions.filter((concession) => {
    const matchesSearch =
      concession.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concession.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || concession.type === typeFilter
    const matchesCounty = countyFilter === "all" || concession.county === countyFilter
    const matchesStatus = statusFilter === "all" || concession.status === statusFilter

    return matchesSearch && matchesType && matchesCounty && matchesStatus
  })

  const stats = {
    totalConcessions: publicConcessions.length,
    activeConcessions: publicConcessions.filter((c) => c.status === "Active").length,
    totalArea: publicConcessions.reduce((sum, c) => sum + Number.parseFloat(c.area.replace(/[^\d.]/g, "")), 0),
    counties: new Set(publicConcessions.map((c) => c.county)).size,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Map className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NBC Public Portal</h1>
                <p className="text-sm text-gray-600">Concessions Transparency Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Language
              </Button>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Liberia Concessions Database</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore active concessions across Liberia. This public portal provides transparent access to concession
            information, promoting accountability and citizen engagement in natural resource management.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalConcessions}</div>
              <div className="text-sm text-gray-600">Total Concessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeConcessions}</div>
              <div className="text-sm text-gray-600">Active Concessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalArea.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Area (ha)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.counties}</div>
              <div className="text-sm text-gray-600">Counties Covered</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Concessions List</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, company, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {concessionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={countyFilter} onValueChange={setCountyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counties</SelectItem>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Renewal Pending">Renewal Pending</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredConcessions.length} of {publicConcessions.length} concessions
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Concessions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Public Concessions Registry</CardTitle>
                <CardDescription>
                  Transparent access to concession information for public accountability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concession</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
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
                          <TableCell>{concession.company}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTypeIcon(concession.type)}</span>
                              <Badge variant="outline">{concession.type}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{concession.county}</div>
                              <div className="text-sm text-gray-500">{concession.district}</div>
                            </div>
                          </TableCell>
                          <TableCell>{concession.area}</TableCell>
                          <TableCell>{concession.duration}</TableCell>
                          <TableCell>{getStatusBadge(concession.status)}</TableCell>
                          <TableCell>
                            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedConcession(concession)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{selectedConcession?.name}</DialogTitle>
                                  <DialogDescription>Detailed information about this concession</DialogDescription>
                                </DialogHeader>
                                {selectedConcession && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Concession ID</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.id}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Company</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.company}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <div className="flex items-center space-x-2">
                                          <span>{getTypeIcon(selectedConcession.type)}</span>
                                          <span className="text-sm text-gray-600">{selectedConcession.type}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <div>{getStatusBadge(selectedConcession.status)}</div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <p className="text-sm text-gray-600">
                                          {selectedConcession.county}, {selectedConcession.district}
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Area</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.area}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Issue Date</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.issueDate}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Expiry Date</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.expiryDate}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Description</label>
                                      <p className="text-sm text-gray-600">{selectedConcession.description}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Coordinates</label>
                                      <p className="text-sm text-gray-600 font-mono">
                                        {selectedConcession.coordinates}
                                      </p>
                                    </div>
                                    {selectedConcession.revenue && (
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Revenue Contribution</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.revenue}</p>
                                      </div>
                                    )}
                                    {selectedConcession.contactInfo && (
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Information</label>
                                        <p className="text-sm text-gray-600">{selectedConcession.contactInfo}</p>
                                      </div>
                                    )}
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

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Concessions Map</CardTitle>
                <CardDescription>Geographical view of all concessions across Liberia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Interactive Map</h3>
                    <p className="text-gray-600 mb-4">Explore concessions geographically with detailed overlays</p>
                    <div className="flex justify-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {stats.totalConcessions} Concessions
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {stats.counties} Counties
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About This Portal</h3>
              <p className="text-sm text-gray-600">
                The NBC Public Portal provides transparent access to concession information, promoting accountability
                and citizen engagement in natural resource management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>National Bureau of Concessions</p>
                <p>Monrovia, Liberia</p>
                <p>Email: info@nbc.gov.lr</p>
                <p>Phone: +231-77-XXX-XXXX</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <a href="#" className="hover:text-blue-600">
                    Concession Guidelines
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-blue-600">
                    Application Process
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-blue-600">
                    Legal Framework
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-blue-600">
                    Data Downloads
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2024 National Bureau of Concessions, Republic of Liberia. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
