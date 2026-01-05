"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, X, Shield } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const DEPARTMENTS = [
  { id: "end_devices", label: "End Devices", description: "Access to manage and configure end devices" },
  { id: "gateways", label: "Gateways", description: "Access to manage and configure IOT gateways" },
  { id: "firmware", label: "Firmware", description: "Access to FOTA updates and firmware management" },
  { id: "network", label: "Network", description: "Access to network statistics and monitoring" },
  { id: "reports", label: "Reports", description: "Access to system reports and analytics" },
];

export default function UsersManagementPage() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    department: "",
    designation: "",
    is_active: true,
    is_superuser: false,
    department_access: [] as string[],
  });

  useEffect(() => {
    if (token && currentUser?.is_superuser) {
      loadUsers();
    }
  }, [token, currentUser]);

  const loadUsers = async () => {
    try {
      if (!token) return;
      const data = await api.users_implementation.getAll(token);
      setUsers(Array.isArray(data) ? data : []);
      setFilteredUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...users];

    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (u: any) =>
          u.username?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.full_name?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department && filters.department !== "all") {
      result = result.filter((u: any) => u.department === filters.department);
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "active") {
        result = result.filter((u: any) => u.is_active);
      } else if (filters.status === "inactive") {
        result = result.filter((u: any) => !u.is_active);
      }
    }

    setFilteredUsers(result);
  }, [users, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      if (editingUser) {
        // UPDATING EXISTING USER
        const dataToSubmit = {
          ...formData,
          password: formData.password || undefined, // Only include password if provided
        };
        await api.users_implementation.update(editingUser.id, dataToSubmit, token);
        toast.success("User updated successfully");
      } else {
        // CREATING NEW USER
        if (!formData.password) {
          toast.error("Password is required for new users");
          return;
        }

        // TypeScript now knows password is definitely a string here
        const dataToSubmit = {
          ...formData,
          password: formData.password,
        };

        await api.users_implementation.create(dataToSubmit, token);
        toast.success("User created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save user");
      console.error(error);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't show password
      full_name: user.full_name || "",
      department: user.department || "",
      designation: user.designation || "",
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      department_access: user.department_access || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await api.users_implementation.delete(id, token);
        toast.success("User deleted successfully");
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete user");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      full_name: "",
      department: "",
      designation: "",
      is_active: true,
      is_superuser: false,
      department_access: [],
    });
  };

  const toggleDepartmentAccess = (deptId: string) => {
    setFormData({
      ...formData,
      department_access: formData.department_access.includes(deptId)
        ? formData.department_access.filter((id) => id !== deptId)
        : [...formData.department_access, deptId],
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "username", header: "Username" },
    { key: "email", header: "Email" },
    { key: "full_name", header: "Full Name" },
    { key: "department", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "is_superuser", header: "Admin", transform: (value) => value ? "Yes" : "No" },
    { key: "is_active", header: "Status", transform: (value) => value ? "Active" : "Inactive" },
    { key: "department_access", header: "Department Access", transform: (value) => Array.isArray(value) ? value.map((d: string) => DEPARTMENTS.find((dept) => dept.id === d)?.label || d).join(", ") : "-" },
  ];

  // Check if user is admin
  if (!currentUser?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  const uniqueDepartments = [...new Set(users.map((u: any) => u.department).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage user accounts with department access permissions
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredUsers}
            columns={exportColumns}
            filename="users"
            sheetName="Users"
          />
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Update user information and permissions"
                    : "Create a new user account with username, password, and department access"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {!editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!editingUser}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters
                      </p>
                    </div>
                  )}

                  {editingUser && (
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password (Optional)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({ ...formData, department: e.target.value })
                        }
                        placeholder="e.g., Sample, IE, Planning"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      placeholder="e.g., Manager, Executive"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">
                        Active User
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_superuser"
                        checked={formData.is_superuser}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_superuser: !!checked })
                        }
                      />
                      <Label htmlFor="is_superuser" className="cursor-pointer">
                        Administrator (Full Access)
                      </Label>
                    </div>
                  </div>

                  {/* Department Access Permissions */}
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Department Access Permissions *
                      </Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Select which departments this user can access. Administrators have access to all departments.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {DEPARTMENTS.map((dept) => (
                        <div
                          key={dept.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={dept.id}
                            checked={formData.department_access.includes(dept.id)}
                            onCheckedChange={() => toggleDepartmentAccess(dept.id)}
                            disabled={formData.is_superuser}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={dept.id}
                              className="cursor-pointer font-medium"
                            >
                              {dept.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {dept.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formData.is_superuser && (
                      <p className="text-xs text-muted-foreground italic">
                        Administrators have access to all departments automatically.
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingUser ? "Update" : "Create"} User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search username, email, name..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-9"
              />
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "", department: "", status: "" })} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {users.length === 0
                    ? "No users found. Create your first user to get started."
                    : "No users match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username}
                    {user.is_superuser && (
                      <Badge variant="destructive" className="ml-2">Admin</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || "-"}</TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>{user.designation || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.is_superuser ? (
                        <Badge variant="default">All Departments</Badge>
                      ) : user.department_access && user.department_access.length > 0 ? (
                        user.department_access.map((dept: string) => {
                          const deptInfo = DEPARTMENTS.find((d) => d.id === dept);
                          return (
                            <Badge key={dept} variant="outline">
                              {deptInfo?.label || dept}
                            </Badge>
                          );
                        })
                      ) : (
                        <Badge variant="secondary">No Access</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? "default" : "secondary"}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.is_superuser}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

