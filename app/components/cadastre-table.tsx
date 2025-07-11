"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Eye, Edit, MapPin, AlertTriangle, CheckCircle, Search, History, Trash2, Loader2 } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface Parcel {
  id: string
  type: string
  county: string
  district: string
  area: string
  coordinates: string
  status: string
  owner: string
  registered: string
  conflicts: number
  created_at?: string
  updated_at?: string
}

export function CadastreTable({ onViewAuditTrail }: { onViewAuditTrail?: (parcelId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Load parcels from database
  useEffect(() => {
    loadParcels()
  }, [])

  const loadParcels = async () => {
    try {
      setIsLoading(true)
      const data = await DatabaseService.getParcels()
      setParcels(data)
    } catch (error) {
      console.error("Failed to load parcels:", error)
      toast({
        title: "Error",
        description: "Failed to load parcels from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registered":
        return <Badge className="bg-green-100 text-green-800">Registered</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case "Disputed":
        return <Badge className="bg-red-100 text-red-800">Disputed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleView = async (parcel: Parcel) => {
    try {
      // Fetch latest data from database
      const latestData = await DatabaseService.getParcelById(parcel.id)
      setSelectedParcel(latestData || parcel)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch parcel details:", error)
      setSelectedParcel(parcel)
      setIsViewDialogOpen(true)
    }
  }

  const handleEdit = async (parcel: Parcel) => {
    try {
      // Fetch latest data from database
      const latestData = await DatabaseService.getParcelById(parcel.id)
      setSelectedParcel(latestData || parcel)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch parcel details:", error)
      setSelectedParcel(parcel)
      setIsEditDialogOpen(true)
    }
  }

  const handleDelete = async (parcelId: string) => {
    try {
      setIsUpdating(true)
      const success = await DatabaseService.deleteParcel(parcelId)

      if (success) {
        setParcels(parcels.filter((p) => p.id !== parcelId))
        toast({
          title: "Success",
          description: "Parcel deleted successfully",
        })

        // Log the action
        await DatabaseService.createLog({
          level: "info",
          category: "Cadastre",
          message: `Parcel ${parcelId} deleted`,
          userId: "current-user-id", // Replace with actual user ID
          userName: "Current User", // Replace with actual user name
          ipAddress: "192.168.1.1", // Replace with actual IP
        })
      }
    } catch (error) {
      console.error("Failed to delete parcel:", error)
      toast({
        title: "Error",
        description: "Failed to delete parcel",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedParcel) return

    try {
      setIsUpdating(true)
      const success = await DatabaseService.updateParcel(selectedParcel.id, selectedParcel)

      if (success) {
        setParcels(parcels.map((p) => (p.id === selectedParcel.id ? selectedParcel : p)))
        setIsEditDialogOpen(false)
        setSelectedParcel(null)

        toast({
          title: "Success",
          description: "Parcel updated successfully",
        })

        // Log the action
        await DatabaseService.createLog({
          level: "info",
          category: "Cadastre",
          message: `Parcel ${selectedParcel.id} updated`,
          userId: "current-user-id",
          userName: "Current User",
          ipAddress: "192.168.1.1",
        })
      }
    } catch (error) {
      console.error("Failed to update parcel:", error)
      toast({
        title: "Error",
        description: "Failed to update parcel",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMapView = (parcel: Parcel) => {
    // Open map view with parcel coordinates
    const coordinates = parcel.coordinates.replace(/[°NSEW]/g, "").split(", ")
    const lat = Number.parseFloat(coordinates[0])
    const lng = Number.parseFloat(coordinates[1])

    // Open in new window with map service
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`
    window.open(mapUrl, "_blank")

    toast({
      title: "Map View",
      description: `Opening map view for parcel ${parcel.id}`,
    })
  }

  const filteredParcels = parcels.filter(
    (parcel) =>
      parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.county.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading parcels...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by parcel ID, owner, or county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" onClick={loadParcels} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <Button variant="outline">All Types</Button>
              <Button variant="outline">All Counties</Button>
              <Button variant="outline">All Status</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parcels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastral Parcels ({filteredParcels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conflicts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParcels.map((parcel) => (
                <TableRow key={parcel.id}>
                  <TableCell className="font-medium">{parcel.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{parcel.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {parcel.county}, {parcel.district}
                      </div>
                      <div className="text-sm text-gray-500">{parcel.coordinates}</div>
                    </div>
                  </TableCell>
                  <TableCell>{parcel.area}</TableCell>
                  <TableCell>{parcel.owner}</TableCell>
                  <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {parcel.conflicts > 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 font-medium">{parcel.conflicts}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">None</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(parcel)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(parcel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleMapView(parcel)}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Audit Trail"
                        onClick={() => onViewAuditTrail?.(parcel.id)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Parcel</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete parcel {parcel.id}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(parcel.id)} disabled={isUpdating}>
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Parcel Details - {selectedParcel?.id}</DialogTitle>
            <DialogDescription>Complete information for this cadastral parcel</DialogDescription>
          </DialogHeader>
          {selectedParcel && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parcel ID</label>
                <p className="text-sm text-gray-600">{selectedParcel.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-gray-600">{selectedParcel.type}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <p className="text-sm text-gray-600">{selectedParcel.county}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <p className="text-sm text-gray-600">{selectedParcel.district}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <p className="text-sm text-gray-600">{selectedParcel.area}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div>{getStatusBadge(selectedParcel.status)}</div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Owner</label>
                <p className="text-sm text-gray-600">{selectedParcel.owner}</p>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Coordinates</label>
                <p className="text-sm text-gray-600">{selectedParcel.coordinates}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Registered</label>
                <p className="text-sm text-gray-600">{selectedParcel.registered}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Conflicts</label>
                <p className="text-sm text-gray-600">{selectedParcel.conflicts}</p>
              </div>
              {selectedParcel.created_at && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-gray-600">{new Date(selectedParcel.created_at).toLocaleString()}</p>
                </div>
              )}
              {selectedParcel.updated_at && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-gray-600">{new Date(selectedParcel.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Parcel - {selectedParcel?.id}</DialogTitle>
            <DialogDescription>Update parcel information</DialogDescription>
          </DialogHeader>
          {selectedParcel && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parcel ID</label>
                <Input value={selectedParcel.id} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input
                  value={selectedParcel.type}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Input
                  value={selectedParcel.county}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, county: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Input
                  value={selectedParcel.district}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, district: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Input
                  value={selectedParcel.area}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Input
                  value={selectedParcel.status}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, status: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Owner</label>
                <Input
                  value={selectedParcel.owner}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, owner: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Coordinates</label>
                <Input
                  value={selectedParcel.coordinates}
                  onChange={(e) => setSelectedParcel({ ...selectedParcel, coordinates: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
