"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle,
  Save,
  Eye,
  Layers,
  Calculator,
  Navigation,
  FileText,
  Loader2,
  X,
} from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface SpatialValidation {
  type: string
  status: "pass" | "warning" | "error"
  message: string
  details?: string
}

interface FormErrors {
  [key: string]: string
}

export function ParcelRegistrationForm() {
  const [activeTab, setActiveTab] = useState("basic")
  const [coordinates, setCoordinates] = useState("")
  const [validationResults, setValidationResults] = useState<SpatialValidation[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState({
    parcelType: "",
    county: "",
    district: "",
    owner: "",
    area: "",
    landUse: "",
    coordinates: "",
    description: "",
    declaredArea: "",
    areaUnit: "hectares",
    contactPhone: "",
    contactEmail: "",
    surveyorName: "",
    surveyDate: "",
    titleDeed: null as File | null,
    surveyReport: null as File | null,
    environmentalClearance: null as File | null,
    sitePhotos: null as File | null,
    communityAgreement: null as File | null,
  })

  const parcelTypes = [
    "Agricultural Land",
    "Residential Property",
    "Commercial Property",
    "Industrial Site",
    "Mining Concession",
    "Forestry Concession",
    "Protected Area",
    "Government Land",
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Basic Information Validation
    if (!formData.parcelType) newErrors.parcelType = "Parcel type is required"
    if (!formData.county) newErrors.county = "County is required"
    if (!formData.district) newErrors.district = "District is required"
    if (!formData.owner) newErrors.owner = "Owner/Applicant name is required"
    if (!formData.landUse) newErrors.landUse = "Intended land use is required"

    // Contact Information Validation
    if (!formData.contactPhone) {
      newErrors.contactPhone = "Contact phone is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number"
    }

    if (!formData.contactEmail) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }

    // Area Validation
    if (!formData.declaredArea) {
      newErrors.declaredArea = "Declared area is required"
    } else if (isNaN(Number(formData.declaredArea)) || Number(formData.declaredArea) <= 0) {
      newErrors.declaredArea = "Please enter a valid area value"
    }

    // Spatial Data Validation
    if (!coordinates && !formData.coordinates) {
      newErrors.coordinates = "Boundary coordinates are required"
    }

    // Survey Information Validation
    if (!formData.surveyorName) newErrors.surveyorName = "Surveyor name is required"
    if (!formData.surveyDate) newErrors.surveyDate = "Survey date is required"

    // Document Validation
    if (!formData.titleDeed) newErrors.titleDeed = "Title deed is required"
    if (!formData.surveyReport) newErrors.surveyReport = "Survey report is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const runSpatialValidation = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    setValidationResults([])

    // Simulate validation process
    const validations = [
      { type: "Coordinate Format", status: "pass" as const, message: "Valid coordinate format detected" },
      { type: "Boundary Closure", status: "pass" as const, message: "Polygon boundaries properly closed" },
      {
        type: "Overlap Check",
        status: "warning" as const,
        message: "Minor overlap detected with adjacent parcel",
        details: "0.02 ha overlap with PAR-2024-001",
      },
      { type: "Buffer Zone", status: "pass" as const, message: "Required buffer zones maintained" },
      {
        type: "Proximity Rules",
        status: "error" as const,
        message: "Too close to protected area",
        details: "Minimum 100m distance required from Sapo National Park",
      },
      { type: "Area Calculation", status: "pass" as const, message: "Calculated area: 125.7 ha" },
    ]

    for (let i = 0; i < validations.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setValidationProgress(((i + 1) / validations.length) * 100)
      setValidationResults((prev) => [...prev, validations[i]])
    }

    setIsValidating(false)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      })
      return
    }

    // Check for validation errors
    const hasErrors = validationResults.some((result) => result.status === "error")
    if (hasErrors) {
      toast({
        title: "Spatial Validation Error",
        description: "Please resolve all spatial validation errors before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare parcel data
      const parcelData = {
        type: formData.parcelType,
        county: formData.county,
        district: formData.district,
        owner: formData.owner,
        area: `${formData.declaredArea} ${formData.areaUnit}`,
        landUse: formData.landUse,
        coordinates: coordinates || formData.coordinates,
        description: formData.description,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        surveyorName: formData.surveyorName,
        surveyDate: formData.surveyDate,
        status: "Pending",
        registered: new Date().toISOString().split("T")[0],
        conflicts: 0,
      }

      // Create parcel in database
      const parcelId = await DatabaseService.createParcel(parcelData)

      // Log the registration
      await DatabaseService.createLog({
        level: "info",
        category: "Cadastre",
        message: `New parcel registered: ${parcelId}`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
        details: JSON.stringify({ parcelId, ...parcelData }),
      })

      toast({
        title: "Success",
        description: `Parcel registered successfully with ID: ${parcelId}`,
      })

      // Reset form
      setFormData({
        parcelType: "",
        county: "",
        district: "",
        owner: "",
        area: "",
        landUse: "",
        coordinates: "",
        description: "",
        declaredArea: "",
        areaUnit: "hectares",
        contactPhone: "",
        contactEmail: "",
        surveyorName: "",
        surveyDate: "",
        titleDeed: null,
        surveyReport: null,
        environmentalClearance: null,
        sitePhotos: null,
        communityAgreement: null,
      })
      setCoordinates("")
      setValidationResults([])
      setErrors({})
      setActiveTab("basic")
    } catch (error) {
      console.error("Failed to register parcel:", error)
      toast({
        title: "Error",
        description: "Failed to register parcel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file })
    if (file && errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parcel Registration</h2>
          <p className="text-gray-600">Register new cadastral parcel with spatial validation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="spatial">Spatial Data</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Parcel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelType">Parcel Type *</Label>
                  <Select
                    value={formData.parcelType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, parcelType: value })
                      if (errors.parcelType) setErrors({ ...errors, parcelType: "" })
                    }}
                  >
                    <SelectTrigger className={errors.parcelType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select parcel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {parcelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parcelType && <p className="text-sm text-red-500">{errors.parcelType}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="county">County *</Label>
                    <Select
                      value={formData.county}
                      onValueChange={(value) => {
                        setFormData({ ...formData, county: value })
                        if (errors.county) setErrors({ ...errors, county: "" })
                      }}
                    >
                      <SelectTrigger className={errors.county ? "border-red-500" : ""}>
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
                    {errors.county && <p className="text-sm text-red-500">{errors.county}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={(e) => {
                        setFormData({ ...formData, district: e.target.value })
                        if (errors.district) setErrors({ ...errors, district: "" })
                      }}
                      className={errors.district ? "border-red-500" : ""}
                    />
                    {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Owner/Applicant *</Label>
                  <Input
                    id="owner"
                    placeholder="Enter owner name or company"
                    value={formData.owner}
                    onChange={(e) => {
                      setFormData({ ...formData, owner: e.target.value })
                      if (errors.owner) setErrors({ ...errors, owner: "" })
                    }}
                    className={errors.owner ? "border-red-500" : ""}
                  />
                  {errors.owner && <p className="text-sm text-red-500">{errors.owner}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+231 XXX XXXX"
                      value={formData.contactPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, contactPhone: e.target.value })
                        if (errors.contactPhone) setErrors({ ...errors, contactPhone: "" })
                      }}
                      className={errors.contactPhone ? "border-red-500" : ""}
                    />
                    {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, contactEmail: e.target.value })
                        if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" })
                      }}
                      className={errors.contactEmail ? "border-red-500" : ""}
                    />
                    {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landUse">Intended Land Use *</Label>
                  <Input
                    id="landUse"
                    placeholder="Describe intended use"
                    value={formData.landUse}
                    onChange={(e) => {
                      setFormData({ ...formData, landUse: e.target.value })
                      if (errors.landUse) setErrors({ ...errors, landUse: "" })
                    }}
                    className={errors.landUse ? "border-red-500" : ""}
                  />
                  {errors.landUse && <p className="text-sm text-red-500">{errors.landUse}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the parcel"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Area Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="declaredArea">Declared Area *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="declaredArea"
                      placeholder="Enter area"
                      value={formData.declaredArea}
                      onChange={(e) => {
                        setFormData({ ...formData, declaredArea: e.target.value })
                        if (errors.declaredArea) setErrors({ ...errors, declaredArea: "" })
                      }}
                      className={errors.declaredArea ? "border-red-500" : ""}
                    />
                    <Select
                      value={formData.areaUnit}
                      onValueChange={(value) => setFormData({ ...formData, areaUnit: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="sqm">Sq. Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.declaredArea && <p className="text-sm text-red-500">{errors.declaredArea}</p>}
                </div>

                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    Area will be automatically calculated from spatial coordinates during validation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="surveyorName">Surveyor Name *</Label>
                      <Input
                        id="surveyorName"
                        placeholder="Licensed surveyor name"
                        value={formData.surveyorName}
                        onChange={(e) => {
                          setFormData({ ...formData, surveyorName: e.target.value })
                          if (errors.surveyorName) setErrors({ ...errors, surveyorName: "" })
                        }}
                        className={errors.surveyorName ? "border-red-500" : ""}
                      />
                      {errors.surveyorName && <p className="text-sm text-red-500">{errors.surveyorName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surveyDate">Survey Date *</Label>
                      <Input
                        id="surveyDate"
                        type="date"
                        value={formData.surveyDate}
                        onChange={(e) => {
                          setFormData({ ...formData, surveyDate: e.target.value })
                          if (errors.surveyDate) setErrors({ ...errors, surveyDate: "" })
                        }}
                        className={errors.surveyDate ? "border-red-500" : ""}
                      />
                      {errors.surveyDate && <p className="text-sm text-red-500">{errors.surveyDate}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <MapPin className="h-4 w-4 mr-2" />
                      Locate on Map
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Navigation className="h-4 w-4 mr-2" />
                      GPS Capture
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spatial Data Tab */}
        <TabsContent value="spatial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coordinate Input</CardTitle>
                <p className="text-sm text-gray-600">Enter boundary coordinates or upload spatial files</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Boundary Coordinates *</Label>
                  <Textarea
                    id="coordinates"
                    placeholder="Enter coordinates (WGS84 format):&#10;6.8319, -9.3658&#10;6.8320, -9.3650&#10;6.8315, -9.3649&#10;6.8314, -9.3657"
                    value={coordinates}
                    onChange={(e) => {
                      setCoordinates(e.target.value)
                      if (errors.coordinates) setErrors({ ...errors, coordinates: "" })
                    }}
                    rows={8}
                    className={`font-mono text-sm ${errors.coordinates ? "border-red-500" : ""}`}
                  />
                  {errors.coordinates && <p className="text-sm text-red-500">{errors.coordinates}</p>}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Shapefile
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Layers className="h-4 w-4 mr-2" />
                    Import KML
                  </Button>
                </div>

                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>Supported formats: Shapefile (.shp), KML, GeoJSON, GPX</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spatial Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Spatial preview will appear here</p>
                    <p className="text-sm text-gray-500">Enter coordinates to see boundary visualization</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coordinate System:</span>
                    <span className="font-medium">WGS84 (EPSG:4326)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Vertices:</span>
                    <span className="font-medium">{coordinates.split("\n").filter((line) => line.trim()).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Calculated Area:</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spatial Validation</CardTitle>
              <p className="text-sm text-gray-600">Run comprehensive spatial checks and validation rules</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Validation Rules</h4>
                  <p className="text-sm text-gray-600">Check overlaps, buffers, proximity, and spatial integrity</p>
                </div>
                <Button onClick={runSpatialValidation} disabled={isValidating || !coordinates}>
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validating...
                    </>
                  ) : (
                    "Run Validation"
                  )}
                </Button>
              </div>

              {isValidating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Validation Progress</span>
                    <span>{Math.round(validationProgress)}%</span>
                  </div>
                  <Progress value={validationProgress} className="w-full" />
                </div>
              )}

              {validationResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Validation Results</h4>
                  {validationResults.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getValidationIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{result.type}</span>
                          {getValidationBadge(result.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        {result.details && <p className="text-xs text-gray-500 mt-1">{result.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {validationResults.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please resolve all errors before proceeding with registration. Warnings can be acknowledged and
                    overridden with proper justification.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <p className="text-sm text-gray-600">Upload required documentation for parcel registration</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Required Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Survey Report *</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="surveyReport"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload("surveyReport", e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("surveyReport")?.click()}
                        >
                          {formData.surveyReport ? "Change" : "Upload"}
                        </Button>
                        {formData.surveyReport && (
                          <Button variant="ghost" size="sm" onClick={() => handleFileUpload("surveyReport", null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {errors.surveyReport && <p className="text-sm text-red-500">{errors.surveyReport}</p>}
                    {formData.surveyReport && <p className="text-xs text-green-600">✓ {formData.surveyReport.name}</p>}

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Title Deed *</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="titleDeed"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => handleFileUpload("titleDeed", e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("titleDeed")?.click()}
                        >
                          {formData.titleDeed ? "Change" : "Upload"}
                        </Button>
                        {formData.titleDeed && (
                          <Button variant="ghost" size="sm" onClick={() => handleFileUpload("titleDeed", null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {errors.titleDeed && <p className="text-sm text-red-500">{errors.titleDeed}</p>}
                    {formData.titleDeed && <p className="text-xs text-green-600">✓ {formData.titleDeed.name}</p>}

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Environmental Clearance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="environmentalClearance"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload("environmentalClearance", e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("environmentalClearance")?.click()}
                        >
                          {formData.environmentalClearance ? "Change" : "Upload"}
                        </Button>
                        {formData.environmentalClearance && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileUpload("environmentalClearance", null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {formData.environmentalClearance && (
                      <p className="text-xs text-green-600">✓ {formData.environmentalClearance.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Optional Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Site Photos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="sitePhotos"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif"
                          multiple
                          onChange={(e) => handleFileUpload("sitePhotos", e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("sitePhotos")?.click()}
                        >
                          {formData.sitePhotos ? "Change" : "Upload"}
                        </Button>
                        {formData.sitePhotos && (
                          <Button variant="ghost" size="sm" onClick={() => handleFileUpload("sitePhotos", null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {formData.sitePhotos && <p className="text-xs text-green-600">✓ {formData.sitePhotos.name}</p>}

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Community Agreement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="communityAgreement"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload("communityAgreement", e.target.files?.[0] || null)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("communityAgreement")?.click()}
                        >
                          {formData.communityAgreement ? "Change" : "Upload"}
                        </Button>
                        {formData.communityAgreement && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileUpload("communityAgreement", null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {formData.communityAgreement && (
                      <p className="text-xs text-green-600">✓ {formData.communityAgreement.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" disabled={isSubmitting}>
                  Save as Draft
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
