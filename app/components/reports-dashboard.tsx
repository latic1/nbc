"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  Download,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface ReportData {
  permitStatus: {
    active: number
    pending: number
    expired: number
    suspended: number
  }
  revenue: {
    total: number
    byType: { [key: string]: number }
    byCounty: { [key: string]: number }
    trend: { month: string; amount: number }[]
  }
  regional: {
    [county: string]: {
      concessions: number
      area: number
      revenue: number
    }
  }
  compliance: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
}

export function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  // Mock report data
  const reportData: ReportData = {
    permitStatus: {
      active: 1234,
      pending: 89,
      expired: 45,
      suspended: 12,
    },
    revenue: {
      total: 125000000, // $125M
      byType: {
        Mining: 65000000,
        Forestry: 35000000,
        Agriculture: 20000000,
        "Oil & Gas": 5000000,
      },
      byCounty: {
        Bong: 25000000,
        Nimba: 22000000,
        "Grand Bassa": 18000000,
        Lofa: 15000000,
        Sinoe: 12000000,
        Maryland: 10000000,
        Others: 23000000,
      },
      trend: [
        { month: "Jan", amount: 8500000 },
        { month: "Feb", amount: 9200000 },
        { month: "Mar", amount: 10100000 },
        { month: "Apr", amount: 11300000 },
        { month: "May", amount: 10800000 },
        { month: "Jun", amount: 12500000 },
        { month: "Jul", amount: 11900000 },
        { month: "Aug", amount: 13200000 },
        { month: "Sep", amount: 12800000 },
        { month: "Oct", amount: 14100000 },
        { month: "Nov", amount: 13600000 },
        { month: "Dec", amount: 15200000 },
      ],
    },
    regional: {
      Bong: { concessions: 156, area: 45000, revenue: 25000000 },
      Nimba: { concessions: 134, area: 52000, revenue: 22000000 },
      "Grand Bassa": { concessions: 98, area: 38000, revenue: 18000000 },
      Lofa: { concessions: 87, area: 41000, revenue: 15000000 },
      Sinoe: { concessions: 76, area: 29000, revenue: 12000000 },
      Maryland: { concessions: 65, area: 25000, revenue: 10000000 },
      Montserrado: { concessions: 89, area: 15000, revenue: 8000000 },
      "Grand Gedeh": { concessions: 54, area: 32000, revenue: 7000000 },
      "River Cess": { concessions: 43, area: 28000, revenue: 5000000 },
      "Grand Kru": { concessions: 38, area: 22000, revenue: 4000000 },
    },
    compliance: {
      excellent: 45,
      good: 35,
      fair: 15,
      poor: 5,
    },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const getComplianceColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "fair":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const totalPermits = Object.values(reportData.permitStatus).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into concessions and revenue performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="bong">Bong</SelectItem>
              <SelectItem value="nimba">Nimba</SelectItem>
              <SelectItem value="grand-bassa">Grand Bassa</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.revenue.total)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% from last year
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Permits</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.permitStatus.active)}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.3% from last month
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.permitStatus.pending)}</p>
                <p className="text-sm text-orange-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -15.2% from last month
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    ((reportData.compliance.excellent + reportData.compliance.good) /
                      Object.values(reportData.compliance).reduce((a, b) => a + b, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  +3.1% from last quarter
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="permits" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permits">Permit Status</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="regional">Regional Distribution</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Permit Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Permit Status Distribution</CardTitle>
                <CardDescription>Current status of all permits in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{formatNumber(reportData.permitStatus.active)}</span>
                      <span className="text-xs text-gray-500">
                        ({((reportData.permitStatus.active / totalPermits) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={(reportData.permitStatus.active / totalPermits) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{formatNumber(reportData.permitStatus.pending)}</span>
                      <span className="text-xs text-gray-500">
                        ({((reportData.permitStatus.pending / totalPermits) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={(reportData.permitStatus.pending / totalPermits) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full" />
                      <span className="text-sm">Expired</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{formatNumber(reportData.permitStatus.expired)}</span>
                      <span className="text-xs text-gray-500">
                        ({((reportData.permitStatus.expired / totalPermits) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={(reportData.permitStatus.expired / totalPermits) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm">Suspended</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{formatNumber(reportData.permitStatus.suspended)}</span>
                      <span className="text-xs text-gray-500">
                        ({((reportData.permitStatus.suspended / totalPermits) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={(reportData.permitStatus.suspended / totalPermits) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Permit Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Permit Trends</CardTitle>
                <CardDescription>New applications and approvals over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Permit Trends Chart</h3>
                    <p className="text-gray-600">Interactive chart showing monthly permit statistics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Concession Type</CardTitle>
                <CardDescription>Annual revenue breakdown by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.revenue.byType).map(([type, amount]) => {
                    const percentage = (amount / reportData.revenue.total) * 100
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-gray-600">{formatCurrency(amount)}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">{percentage.toFixed(1)}%</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue performance throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Revenue Trend Chart</h3>
                    <p className="text-gray-600">Monthly revenue progression with trend analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by County */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by County</CardTitle>
              <CardDescription>Geographic distribution of revenue generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(reportData.revenue.byCounty).map(([county, amount]) => (
                  <div key={county} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{county}</span>
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</div>
                    <div className="text-sm text-gray-600">
                      {((amount / reportData.revenue.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution Analysis</CardTitle>
              <CardDescription>Concessions and revenue distribution across counties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">County</th>
                      <th className="text-right p-2">Concessions</th>
                      <th className="text-right p-2">Total Area (ha)</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Revenue/ha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.regional)
                      .sort(([, a], [, b]) => b.revenue - a.revenue)
                      .map(([county, data]) => (
                        <tr key={county} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{county}</td>
                          <td className="p-2 text-right">{formatNumber(data.concessions)}</td>
                          <td className="p-2 text-right">{formatNumber(data.area)}</td>
                          <td className="p-2 text-right">{formatCurrency(data.revenue)}</td>
                          <td className="p-2 text-right">{formatCurrency(data.revenue / data.area)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Regional Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Revenue Distribution</CardTitle>
              <CardDescription>Interactive map showing revenue by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Interactive Regional Map</h3>
                  <p className="text-gray-600 mb-4">
                    Heat map visualization of revenue distribution across Liberian counties
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Badge variant="outline">15 Counties</Badge>
                    <Badge variant="outline">
                      {formatNumber(Object.values(reportData.regional).reduce((sum, r) => sum + r.concessions, 0))}{" "}
                      Concessions
                    </Badge>
                    <Badge variant="outline">{formatCurrency(reportData.revenue.total)} Total Revenue</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status Overview</CardTitle>
                <CardDescription>Current compliance ratings across all concessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.compliance).map(([level, percentage]) => (
                    <div key={level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getComplianceColor(level)}`} />
                          <span className="text-sm font-medium capitalize">{level}</span>
                        </div>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Improvement Trends</CardTitle>
                <CardDescription>Quarterly compliance performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Compliance Trends</h3>
                    <p className="text-gray-600">Quarterly compliance improvement tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Issues</CardTitle>
              <CardDescription>Current compliance violations requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Environmental Violations</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    3 concessions with outstanding environmental compliance issues
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Reporting Delays</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">12 concessions with overdue quarterly reports</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Documentation Updates</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">8 concessions requiring updated documentation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
