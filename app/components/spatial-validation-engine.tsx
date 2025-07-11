"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle, MapPin, Layers, Calculator, Shield, Zap, Settings } from "lucide-react"

interface ValidationRule {
  id: string
  name: string
  description: string
  category: "geometry" | "overlap" | "buffer" | "proximity" | "legal"
  severity: "error" | "warning" | "info"
  enabled: boolean
}

interface ValidationResult {
  ruleId: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: string
  affectedArea?: number
  recommendations?: string[]
}

export function SpatialValidationEngine() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ValidationResult[]>([])

  const validationRules: ValidationRule[] = [
    {
      id: "geom_closure",
      name: "Boundary Closure",
      description: "Verify polygon boundaries are properly closed",
      category: "geometry",
      severity: "error",
      enabled: true,
    },
    {
      id: "geom_self_intersect",
      name: "Self-Intersection Check",
      description: "Detect self-intersecting boundaries",
      category: "geometry",
      severity: "error",
      enabled: true,
    },
    {
      id: "overlap_adjacent",
      name: "Adjacent Parcel Overlap",
      description: "Check for overlaps with neighboring parcels",
      category: "overlap",
      severity: "error",
      enabled: true,
    },
    {
      id: "overlap_concession",
      name: "Concession Overlap",
      description: "Verify no overlap with existing concessions",
      category: "overlap",
      severity: "warning",
      enabled: true,
    },
    {
      id: "buffer_water",
      name: "Water Body Buffer",
      description: "Maintain required distance from water bodies",
      category: "buffer",
      severity: "warning",
      enabled: true,
    },
    {
      id: "buffer_road",
      name: "Road Buffer Zone",
      description: "Check setback requirements from roads",
      category: "buffer",
      severity: "info",
      enabled: true,
    },
    {
      id: "proximity_protected",
      name: "Protected Area Proximity",
      description: "Verify distance from protected areas",
      category: "proximity",
      severity: "error",
      enabled: true,
    },
    {
      id: "legal_zoning",
      name: "Zoning Compliance",
      description: "Check compliance with local zoning laws",
      category: "legal",
      severity: "warning",
      enabled: true,
    },
  ]

  const runValidation = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults([])

    const enabledRules = validationRules.filter((rule) => rule.enabled)
    const mockResults: ValidationResult[] = [
      {
        ruleId: "geom_closure",
        status: "pass",
        message: "Boundary properly closed",
      },
      {
        ruleId: "geom_self_intersect",
        status: "pass",
        message: "No self-intersections detected",
      },
      {
        ruleId: "overlap_adjacent",
        status: "warning",
        message: "Minor overlap detected",
        details: "0.02 ha overlap with PAR-2024-001",
        affectedArea: 0.02,
        recommendations: ["Adjust boundary to eliminate overlap", "Contact adjacent parcel owner"],
      },
      {
        ruleId: "overlap_concession",
        status: "pass",
        message: "No concession overlaps",
      },
      {
        ruleId: "buffer_water",
        status: "fail",
        message: "Insufficient buffer from water body",
        details: "Minimum 30m buffer required from St. Paul River",
        recommendations: ["Adjust boundary to maintain 30m setback", "Apply for buffer variance"],
      },
      {
        ruleId: "proximity_protected",
        status: "fail",
        message: "Too close to protected area",
        details: "Located 50m from Sapo National Park (minimum 100m required)",
        recommendations: ["Relocate parcel boundary", "Submit environmental impact assessment"],
      },
      {
        ruleId: "legal_zoning",
        status: "pass",
        message: "Compliant with agricultural zoning",
      },
    ]

    for (let i = 0; i < enabledRules.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProgress(((i + 1) / enabledRules.length) * 100)

      const result = mockResults.find((r) => r.ruleId === enabledRules[i].id)
      if (result) {
        setResults((prev) => [...prev, result])
      }
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "fail":
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "geometry":
        return <Calculator className="h-4 w-4" />
      case "overlap":
        return <Layers className="h-4 w-4" />
      case "buffer":
        return <Shield className="h-4 w-4" />
      case "proximity":
        return <MapPin className="h-4 w-4" />
      case "legal":
        return <Settings className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const passCount = results.filter((r) => r.status === "pass").length
  const warningCount = results.filter((r) => r.status === "warning").length
  const failCount = results.filter((r) => r.status === "fail").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spatial Validation Engine</CardTitle>
              <p className="text-sm text-gray-600">Comprehensive spatial rule checking and validation</p>
            </div>
            <Button onClick={runValidation} disabled={isRunning}>
              {isRunning ? "Running..." : "Run All Checks"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Validation Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{passCount}</div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-yellow-700">Warnings</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Validation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(rule.category)}
                    <div>
                      <div className="font-medium text-sm">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {rule.severity}
                    </Badge>
                    <input type="checkbox" checked={rule.enabled} onChange={() => {}} className="rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Run validation to see results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => {
                  const rule = validationRules.find((r) => r.id === result.ruleId)
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{rule?.name}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          {result.details && <p className="text-xs text-gray-500 mt-1">{result.details}</p>}
                          {result.affectedArea && (
                            <p className="text-xs text-blue-600 mt-1">Affected area: {result.affectedArea} ha</p>
                          )}
                        </div>
                      </div>

                      {result.recommendations && result.recommendations.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Recommendations:</strong>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {result.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
