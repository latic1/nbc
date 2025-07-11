"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Shield, Plus, Edit, Trash2, Users, Eye } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
}

export function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)

  const permissions: Permission[] = [
    // Cadastre Permissions
    {
      id: "cadastre.view",
      name: "View Cadastre",
      description: "View cadastral parcels and data",
      category: "Cadastre",
    },
    {
      id: "cadastre.create",
      name: "Create Parcels",
      description: "Register new cadastral parcels",
      category: "Cadastre",
    },
    { id: "cadastre.edit", name: "Edit Parcels", description: "Modify existing parcel data", category: "Cadastre" },
    { id: "cadastre.delete", name: "Delete Parcels", description: "Remove parcels from system", category: "Cadastre" },
    {
      id: "cadastre.validate",
      name: "Spatial Validation",
      description: "Run spatial validation checks",
      category: "Cadastre",
    },

    // Concessions Permissions
    { id: "concessions.view", name: "View Concessions", description: "View concession data", category: "Concessions" },
    {
      id: "concessions.create",
      name: "Create Concessions",
      description: "Create new concession applications",
      category: "Concessions",
    },
    {
      id: "concessions.edit",
      name: "Edit Concessions",
      description: "Modify concession data",
      category: "Concessions",
    },
    {
      id: "concessions.approve",
      name: "Approve Concessions",
      description: "Approve or reject applications",
      category: "Concessions",
    },
    {
      id: "concessions.renew",
      name: "Renew Concessions",
      description: "Process concession renewals",
      category: "Concessions",
    },

    // GIS Permissions
    { id: "gis.view", name: "View Maps", description: "Access GIS mapping interface", category: "GIS" },
    { id: "gis.edit", name: "Edit Maps", description: "Modify map layers and data", category: "GIS" },
    { id: "gis.export", name: "Export Maps", description: "Export map data and images", category: "GIS" },
    {
      id: "gis.analysis",
      name: "Spatial Analysis",
      description: "Perform spatial analysis operations",
      category: "GIS",
    },

    // User Management Permissions
    { id: "users.view", name: "View Users", description: "View user accounts", category: "Administration" },
    { id: "users.create", name: "Create Users", description: "Create new user accounts", category: "Administration" },
    { id: "users.edit", name: "Edit Users", description: "Modify user accounts", category: "Administration" },
    { id: "users.delete", name: "Delete Users", description: "Remove user accounts", category: "Administration" },
    {
      id: "roles.manage",
      name: "Manage Roles",
      description: "Create and modify user roles",
      category: "Administration",
    },

    // Reports Permissions
    { id: "reports.view", name: "View Reports", description: "Access system reports", category: "Reports" },
    { id: "reports.create", name: "Create Reports", description: "Generate custom reports", category: "Reports" },
    { id: "reports.export", name: "Export Reports", description: "Export report data", category: "Reports" },

    // System Permissions
    { id: "system.settings", name: "System Settings", description: "Modify system configuration", category: "System" },
    { id: "system.audit", name: "Audit Logs", description: "View system audit trails", category: "System" },
    { id: "system.backup", name: "System Backup", description: "Perform system backups", category: "System" },
  ]

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "role-001",
      name: "System Administrator",
      description: "Full system access with all permissions",
      permissions: permissions.map((p) => p.id),
      userCount: 2,
      isSystem: true,
    },
    {
      id: "role-002",
      name: "Division Manager",
      description: "Manage division operations and approve applications",
      permissions: [
        "cadastre.view",
        "cadastre.create",
        "cadastre.edit",
        "cadastre.validate",
        "concessions.view",
        "concessions.create",
        "concessions.edit",
        "concessions.approve",
        "concessions.renew",
        "gis.view",
        "gis.edit",
        "gis.analysis",
        "reports.view",
        "reports.create",
        "reports.export",
        "users.view",
        "system.audit",
      ],
      userCount: 4,
      isSystem: false,
    },
    {
      id: "role-003",
      name: "Senior Surveyor",
      description: "Advanced cadastral operations and spatial validation",
      permissions: [
        "cadastre.view",
        "cadastre.create",
        "cadastre.edit",
        "cadastre.validate",
        "gis.view",
        "gis.edit",
        "gis.analysis",
        "gis.export",
        "reports.view",
        "reports.create",
        "system.audit",
      ],
      userCount: 8,
      isSystem: false,
    },
    {
      id: "role-004",
      name: "Surveyor",
      description: "Basic cadastral operations and data entry",
      permissions: ["cadastre.view", "cadastre.create", "cadastre.edit", "gis.view", "gis.edit", "reports.view"],
      userCount: 15,
      isSystem: false,
    },
    {
      id: "role-005",
      name: "Data Entry Clerk",
      description: "Basic data entry and viewing permissions",
      permissions: ["cadastre.view", "cadastre.create", "concessions.view", "gis.view", "reports.view"],
      userCount: 12,
      isSystem: false,
    },
  ])

  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
  })

  const handleCreateRole = () => {
    const role: Role = {
      ...newRole,
      id: `role-${String(roles.length + 1).padStart(3, "0")}`,
      userCount: 0,
      isSystem: false,
    } as Role

    setRoles([...roles, role])
    setNewRole({ name: "", description: "", permissions: [] })
    setIsCreateDialogOpen(false)
  }

  const handleEditRole = () => {
    if (selectedRole) {
      setRoles(roles.map((r) => (r.id === selectedRole.id ? selectedRole : r)))
      setIsEditDialogOpen(false)
      setSelectedRole(null)
    }
  }

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter((r) => r.id !== roleId))
  }

  const togglePermission = (
    permissionId: string,
    rolePermissions: string[],
    setPermissions: (permissions: string[]) => void,
  ) => {
    if (rolePermissions.includes(permissionId)) {
      setPermissions(rolePermissions.filter((p) => p !== permissionId))
    } else {
      setPermissions([...rolePermissions, permissionId])
    }
  }

  const getPermissionsByCategory = (category: string) => {
    return permissions.filter((p) => p.category === category)
  }

  const categories = [...new Set(permissions.map((p) => p.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-gray-600">Manage user roles and assign permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                {categories.map((category) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getPermissionsByCategory(category).map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={newRole.permissions?.includes(permission.id)}
                            onCheckedChange={() =>
                              togglePermission(permission.id, newRole.permissions || [], (permissions) =>
                                setNewRole({ ...newRole, permissions }),
                              )
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                              {permission.name}
                            </Label>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Roles ({roles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">{role.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions.length} permissions</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge className="bg-blue-100 text-blue-800">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role)
                          setIsPermissionsDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role)
                          setIsEditDialogOpen(true)
                        }}
                        disabled={role.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={role.isSystem || role.userCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction>
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

      {/* View Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Permissions - {selectedRole?.name}</DialogTitle>
            <DialogDescription>View all permissions assigned to this role</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryPermissions = getPermissionsByCategory(category)
                const assignedPermissions = categoryPermissions.filter((p) => selectedRole.permissions.includes(p.id))

                if (assignedPermissions.length === 0) return null

                return (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        {category}
                        <Badge variant="outline">
                          {assignedPermissions.length} of {categoryPermissions.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {assignedPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{permission.name}</p>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role - {selectedRole?.name}</DialogTitle>
            <DialogDescription>Modify role permissions and details</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRoleName">Role Name</Label>
                  <Input
                    id="editRoleName"
                    value={selectedRole.name}
                    onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description</Label>
                <Textarea
                  id="editRoleDescription"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                {categories.map((category) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getPermissionsByCategory(category).map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={selectedRole.permissions.includes(permission.id)}
                            onCheckedChange={() =>
                              togglePermission(permission.id, selectedRole.permissions, (permissions) =>
                                setSelectedRole({ ...selectedRole, permissions }),
                              )
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium cursor-pointer">
                              {permission.name}
                            </Label>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
