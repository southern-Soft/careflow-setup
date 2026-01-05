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

export default function EndDeviceManagementPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
    const [displayedDevices, setDisplayedDevices] = useState<any[]>([]);
    const [rowLimit, setRowLimit] = useState<number | "all">(50);
    const [filters, setFilters] = useState({ search: "" });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<any>(null);
    const [formData, setFormData] = useState({
        end_device_name: "",
        end_device_ID: "",
        maximum_bus: 0,
        fota_update_version: "",
        address: "",
    });

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            const data = await api.end_device.getAll();
            setDevices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load devices:", error);
            toast.error("Failed to load devices");
            setDevices([]);
        }
    };

    const clearFilters = () => {
        setFilters({ search: "" });
    };

    useEffect(() => {
        let result = [...devices];
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (device: any) =>
                    device.end_device_name?.toLowerCase().includes(searchLower) ||
                    device.end_device_ID?.toLowerCase().includes(searchLower) ||
                    device.fota_update_version?.toLowerCase().includes(searchLower)
            );
        }
        setFilteredDevices(result);
    }, [devices, filters]);

    useEffect(() => {
        if (rowLimit === "all") {
            setDisplayedDevices(filteredDevices);
        } else {
            setDisplayedDevices(filteredDevices.slice(0, rowLimit));
        }
    }, [filteredDevices, rowLimit]);

    const handleDialogOpen = (isOpen: boolean) => {
        if (isOpen) {
            if (!editingDevice) resetForm();
            setIsDialogOpen(true);
        } else {
            setIsDialogOpen(false);
            setEditingDevice(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.end_device_name || !formData.end_device_ID) {
            toast.error("Name and ID are required");
            return;
        }

        try {
            if (editingDevice) {
                await api.end_device.update(editingDevice.id, formData);
                toast.success("End Device updated successfully");
            } else {
                await api.end_device.create(formData);
                toast.success("End Device created successfully");
            }
            setIsDialogOpen(false);
            resetForm();
            loadDevices();
        } catch (error: any) {
            console.error("Failed to save device:", error);
            toast.error(error.message || "Failed to save device");
        }
    };

    const handleEdit = (device: any) => {
        setEditingDevice(device);
        setFormData({
            end_device_name: device.end_device_name,
            end_device_ID: device.end_device_ID,
            maximum_bus: device.maximum_bus,
            fota_update_version: device.fota_update_version || "",
            address: device.address || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this device?")) {
            try {
                await api.end_device.delete(id);
                toast.success("Device deleted successfully");
                loadDevices();
            } catch (error) {
                toast.error("Failed to delete device");
                console.error(error);
            }
        }
    };

    const resetForm = () => {
        setEditingDevice(null);
        setFormData({
            end_device_name: "",
            end_device_ID: "",
            maximum_bus: 0,
            fota_update_version: "",
            address: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">End Device Management</h1>
                    <p className="text-muted-foreground">
                        Manage your IOT end devices
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add End Device
                    </Button>
                </div>
            </div>

            <div className="rounded-md border p-4 bg-card">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search devices..."
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
                            <TableHead>Device ID</TableHead>
                            <TableHead>Device Name</TableHead>
                            <TableHead>Max Bus</TableHead>
                            <TableHead>FOTA Version</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedDevices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    {devices.length === 0
                                        ? "No devices found. Add your first end device."
                                        : "No devices match your filter."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedDevices.map((device) => (
                                <TableRow key={device.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{device.end_device_ID}</TableCell>
                                    <TableCell className="font-medium">{device.end_device_name}</TableCell>
                                    <TableCell>{device.maximum_bus}</TableCell>
                                    <TableCell>{device.fota_update_version || "-"}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{device.address || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(device)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(device.id)}>
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
                        <DialogTitle>{editingDevice ? "Edit End Device" : "Add New End Device"}</DialogTitle>
                        <DialogDescription>
                            Enter device details below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="end_device_name">Device Name *</Label>
                                <Input
                                    id="end_device_name"
                                    value={formData.end_device_name}
                                    onChange={(e) => setFormData({ ...formData, end_device_name: e.target.value })}
                                    placeholder="Temp Sensor"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_device_ID">Device ID *</Label>
                                <Input
                                    id="end_device_ID"
                                    value={formData.end_device_ID}
                                    onChange={(e) => setFormData({ ...formData, end_device_ID: e.target.value })}
                                    placeholder="ED-2024-001"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="maximum_bus">Maximum Bus</Label>
                                    <Input
                                        id="maximum_bus"
                                        type="number"
                                        value={formData.maximum_bus}
                                        onChange={(e) => setFormData({ ...formData, maximum_bus: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fota_update_version">FOTA Version</Label>
                                    <Input
                                        id="fota_update_version"
                                        value={formData.fota_update_version}
                                        onChange={(e) => setFormData({ ...formData, fota_update_version: e.target.value })}
                                        placeholder="v1.0.0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Installation address..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{editingDevice ? "Update" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
