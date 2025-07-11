"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Square,
  Circle,
  OctagonIcon as Polygon,
} from "lucide-react"

export function MapComponent() {
  const [activeLayers, setActiveLayers] = useState({
    counties: true,
    concessions: true,
    protected: false,
    mining: true,
    forestry: false,
    agriculture: true,
  })

  const layers = [
    { id: "counties", name: "County Boundaries", color: "bg-blue-500" },
    { id: "concessions", name: "All Concessions", color: "bg-purple-500" },
    { id: "protected", name: "Protected Areas", color: "bg-green-500" },
    { id: "mining", name: "Mining Concessions", color: "bg-orange-500" },
    { id: "forestry", name: "Forestry Concessions", color: "bg-emerald-500" },
    { id: "agriculture", name: "Agricultural Land", color: "bg-yellow-500" },
  ]

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev],
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Map Area */}
      <div className="lg:col-span-3">
        <Card className="h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Interactive Map</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Shapefile
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            {/* Map Placeholder */}
            <div className="h-[500px] bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
              {/* Simulated Map Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-48 bg-white/80 rounded-lg shadow-lg p-6 backdrop-blur-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">Liberia - NBC Concessions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Interactive map showing cadastral boundaries and concession areas
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        15 Counties
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        1,234 Concessions
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="bg-white/90">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/90">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/90">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawing Tools */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <Button variant="outline" size="sm" className="bg-white/90">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/90">
                  <Circle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/90">
                  <Polygon className="h-4 w-4" />
                </Button>
              </div>

              {/* Coordinates Display */}
              <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-xs font-mono">
                6.4281° N, 9.4295° W
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layers Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Map Layers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center space-x-3">
                <Checkbox
                  id={layer.id}
                  checked={activeLayers[layer.id as keyof typeof activeLayers]}
                  onCheckedChange={() => toggleLayer(layer.id)}
                />
                <div className={`w-3 h-3 rounded ${layer.color}`} />
                <label
                  htmlFor={layer.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {layer.name}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Spatial Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Spatial Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Buffer Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Overlap Detection
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Proximity Check
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Area Calculation
            </Button>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-1 bg-red-500" />
              <span>Conflict Areas</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-1 bg-green-500" />
              <span>Approved Concessions</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-1 bg-yellow-500" />
              <span>Pending Applications</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-1 bg-gray-500" />
              <span>Protected Areas</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
