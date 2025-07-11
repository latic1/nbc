"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building, FileText, Clock } from "lucide-react"

export function SearchDialog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const searchResults = [
    {
      id: "PAR-2024-001",
      type: "Parcel",
      title: "Agricultural Land - Bong County",
      description: "125.5 ha agricultural parcel in Jorquelleh District",
      icon: MapPin,
      status: "Registered",
    },
    {
      id: "CON-2024-002",
      type: "Concession",
      title: "Nimba Forest Concession",
      description: "15,680 ha forestry concession by Sustainable Timber Corp",
      icon: Building,
      status: "Active",
    },
    {
      id: "REP-2024-003",
      type: "Report",
      title: "Monthly Cadastre Summary",
      description: "January 2024 cadastre registration report",
      icon: FileText,
      status: "Generated",
    },
  ]

  const filteredResults = searchResults.filter(
    (result) =>
      result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search parcels, concessions..."
            className="pl-10 w-80 cursor-pointer"
            readOnly
            onClick={() => setIsOpen(true)}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search NBC LandSight</DialogTitle>
          <DialogDescription>Search for parcels, concessions, reports, and more</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {searchTerm && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => {
                      alert(`Opening ${result.type}: ${result.title}`)
                      setIsOpen(false)
                    }}
                  >
                    <result.icon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{result.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{result.description}</p>
                      <p className="text-xs text-gray-500">{result.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No results found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Recent Searches</h4>
              <div className="space-y-2">
                {["PAR-2024-001", "Bong County parcels", "Mining concessions"].map((term) => (
                  <div
                    key={term}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => setSearchTerm(term)}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
