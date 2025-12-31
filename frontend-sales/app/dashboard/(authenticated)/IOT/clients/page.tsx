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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function ClientManagementPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [displayedClients, setDisplayedClients] = useState<any[]>([]);
    const [rowLimit, setRowLimit] = useState<number | "all">(50);
    const [filters, setFilters] = useState({ search: "" });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [formData, setFormData] = useState({
        client_name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await api.clients.getAll();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load clients:", error);
            toast.error("Failed to load clients");
            setClients([]);
        }
    };

    const clearFilters = () => {
        setFilters({ search: "" });
    };

    useEffect(() => {
        let result = [...clients];
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (client: any) =>
                    client.client_name?.toLowerCase().includes(searchLower) ||
                    client.client_ID?.toLowerCase().includes(searchLower) ||
                    client.email?.toLowerCase().includes(searchLower) ||
                    client.phone?.toLowerCase().includes(searchLower)
            );
        }
        setFilteredClients(result);
    }, [clients, filters]);

    useEffect(() => {
        if (rowLimit === "all") {
            setDisplayedClients(filteredClients);
        } else {
            setDisplayedClients(filteredClients.slice(0, rowLimit));
        }
    }, [filteredClients, rowLimit]);

    const handleDialogOpen = (isOpen: boolean) => {
        if (isOpen) {
            if (!editingClient) resetForm();
            setIsDialogOpen(true);
        } else {
            setIsDialogOpen(false);
            setEditingClient(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_name) {
            toast.error("Client Name is required");
            return;
        }

        try {
            if (editingClient) {
                await api.clients.update(editingClient.id, formData);
                toast.success("Client updated successfully");
            } else {
                await api.clients.create(formData);
                toast.success("Client created successfully");
            }
            setIsDialogOpen(false);
            resetForm();
            loadClients();
        } catch (error: any) {
            console.error("Failed to save client:", error);
            toast.error(error.message || "Failed to save client");
        }
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setFormData({
            client_name: client.client_name,
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this client?")) {
            try {
                await api.clients.delete(id);
                toast.success("Client deleted successfully");
                loadClients();
            } catch (error) {
                toast.error("Failed to delete client");
                console.error(error);
            }
        }
    };

    const resetForm = () => {
        setEditingClient(null);
        setFormData({
            client_name: "",
            email: "",
            phone: "",
            address: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Client Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage clients for order processing
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Client
                    </Button>
                </div>
            </div>

            <div className="rounded-md border p-4 bg-card">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Select
                        value={rowLimit.toString()}
                        onValueChange={(value) => setRowLimit(value === "all" ? "all" : parseInt(value))}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Rows" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">Show 10</SelectItem>
                            <SelectItem value="20">Show 20</SelectItem>
                            <SelectItem value="50">Show 50</SelectItem>
                            <SelectItem value="all">Show All</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client ID</TableHead>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    {clients.length === 0
                                        ? "No clients found. Create your first client."
                                        : "No clients match your filter."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{client.client_ID}</TableCell>
                                    <TableCell className="font-medium">{client.client_name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{client.address}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                        <DialogDescription>
                            Enter client details below. ID will be auto-generated.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="client_name">Client Name *</Label>
                                <Input
                                    id="client_name"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                    placeholder="ACME Corp"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@acme.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1-234-567-890"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full business address..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{editingClient ? "Update" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
