"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Filter, Loader2 } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  status: "Active" | "Inactive" | "Suspended"
  lastLogin: string
  joinDate: string
  avatar?: string
  created_at?: string
  updated_at?: string
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const [newUser, setNewUser] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
  })

  const roles = [
    "System Administrator",
    "Division Manager",
    "Senior Surveyor",
    "Surveyor",
    "GIS Analyst",
    "Data Entry Clerk",
  ]

  const departments = ["Cadastre Division", "Concessions Division", "GIS Department", "IT Department", "Administration"]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await DatabaseService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "Suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCreateUser = async () => {
    try {
      setIsUpdating(true)
      const userId = await DatabaseService.createUser({
        ...newUser,
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
      })

      const createdUser: User = {
        ...newUser,
        id: userId,
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
      } as User

      setUsers([...users, createdUser])
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        department: "",
        status: "Active",
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "User created successfully",
      })

      // Log the action
      await DatabaseService.createLog({
        level: "info",
        category: "Administration",
        message: `User ${createdUser.firstName} ${createdUser.lastName} created`,
        userId: "current-user-id",
        userName: "Current User",
        ipAddress: "192.168.1.1",
      })
    } catch (error) {
      console.error("Failed to create user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      setIsUpdating(true)
      const success = await DatabaseService.updateUser(selectedUser.id, selectedUser)

      if (success) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)))
        setIsEditDialogOpen(false)
        setSelectedUser(null)

        toast({
          title: "Success",
          description: "User updated successfully",
        })

        // Log the action
        await DatabaseService.createLog({
          level: "info",
          category: "Administration",
          message: `User ${selectedUser.firstName} ${selectedUser.lastName} updated`,
          userId: "current-user-id",
          userName: "Current User",
          ipAddress: "192.168.1.1",
        })
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsUpdating(true)
      const success = await DatabaseService.deleteUser(userId)

      if (success) {
        const deletedUser = users.find((u) => u.id === userId)
        setUsers(users.filter((u) => u.id !== userId))

        toast({
          title: "Success",
          description: "User deleted successfully",
        })

        // Log the action
        if (deletedUser) {
          await DatabaseService.createLog({
            level: "info",
            category: "Administration",
            message: `User ${deletedUser.firstName} ${deletedUser.lastName} deleted`,
            userId: "current-user-id",
            userName: "Current User",
            ipAddress: "192.168.1.1",
          })
        }
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      const newStatus = user.status === "Active" ? "Inactive" : "Active"
      const success = await DatabaseService.updateUser(userId, { status: newStatus })

      if (success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))

        toast({
          title: "Success",
          description: `User status changed to ${newStatus}`,
        })

        // Log the action
        await DatabaseService.createLog({
          level: "info",
          category: "Administration",
          message: `User ${user.firstName} ${user.lastName} status changed to ${newStatus}`,
          userId: "current-user-id",
          userName: "Current User",
          ipAddress: "192.168.1.1",
        })
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleViewUser = async (user: User) => {
    try {
      const latestData = await DatabaseService.getUserById(user.id)
      setSelectedUser(latestData || user)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch user details:", error)
      setSelectedUser(user)
      setIsViewDialogOpen(true)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users, roles, and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newUser.department}
                  onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={!newUser.firstName || !newUser.lastName || !newUser.email || isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                All Roles
              </Button>
              <Button variant="outline" size="sm">
                All Departments
              </Button>
              <Button variant="outline" size="sm">
                All Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>System Users ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        className={user.status === "Active" ? "text-orange-600" : "text-green-600"}
                        disabled={isUpdating}
                      >
                        {user.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} disabled={isUpdating}>
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information for this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.role}</p>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-gray-600">{selectedUser.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <p className="text-sm text-gray-600">{selectedUser.department}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Join Date</label>
                  <p className="text-sm text-gray-600">{selectedUser.joinDate}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Login</label>
                  <p className="text-sm text-gray-600">{selectedUser.lastLogin}</p>
                </div>
                {selectedUser.created_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-gray-600">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={selectedUser.firstName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={selectedUser.lastName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Select
                  value={selectedUser.department}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, status: value as User["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
