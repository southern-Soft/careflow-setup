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

export default function GatewayManagementPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [filteredGateways, setFilteredGateways] = useState<any[]>([]);
  const [displayedGateways, setDisplayedGateways] = useState<any[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [formData, setFormData] = useState({
    tenant_name: "",
    gateway_name: "",
    gateway_ID: "",
    application_name: "",
    application_description: "",
    application_tags: "",
    gateway_stats_interval: "30",
  });

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      const data = await api.gateway.getAll();
      setGateways(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load gateways:", error);
      toast.error("Failed to load gateways");
      setGateways([]);
    }
  };

  const clearFilters = () => {
    setFilters({ search: "" });
  };

  useEffect(() => {
    let result = [...gateways];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (gateway: any) =>
          gateway.gateway_name?.toLowerCase().includes(searchLower) ||
          gateway.gateway_ID?.toLowerCase().includes(searchLower) ||
          gateway.application_name?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredGateways(result);
  }, [gateways, filters]);

  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedGateways(filteredGateways);
    } else {
      setDisplayedGateways(filteredGateways.slice(0, rowLimit));
    }
  }, [filteredGateways, rowLimit]);

  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      if (!editingGateway) resetForm();
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      setEditingGateway(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gateway_name || !formData.gateway_ID || !formData.application_name || !formData.tenant_name) {
      toast.error("Tenant Name, Gateway Name, ID, and Application Name are required");
      return;
    }

    try {
      if (editingGateway) {
        await api.gateway.update(editingGateway.id, formData);
        toast.success("Gateway updated successfully");
      } else {
        await api.gateway.create(formData);
        toast.success("Gateway created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadGateways();
    } catch (error: any) {
      console.error("Failed to save gateway:", error);
      toast.error(error.message || "Failed to save gateway");
    }
  };

  const handleEdit = (gateway: any) => {
    setEditingGateway(gateway);
    setFormData({
      tenant_name: gateway.tenant_name,
      gateway_name: gateway.gateway_name,
      gateway_ID: gateway.gateway_ID,
      application_name: gateway.application_name,
      application_description: gateway.application_description || "",
      application_tags: gateway.application_tags || "",
      gateway_stats_interval: gateway.gateway_stats_interval || "30",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this gateway?")) {
      try {
        await api.gateway.delete(id);
        toast.success("Gateway deleted successfully");
        loadGateways();
      } catch (error) {
        toast.error("Failed to delete gateway");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingGateway(null);
    setFormData({
      tenant_name: "",
      gateway_name: "",
      gateway_ID: "",
      application_name: "",
      application_description: "",
      application_tags: "",
      gateway_stats_interval: "30",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gateway Management</h1>
          <p className="text-muted-foreground">
            Manage your IOT gateways and applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Gateway
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gateways..."
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
              <TableHead>Gateway ID</TableHead>
              <TableHead>Gateway Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Stats Interval</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedGateways.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {gateways.length === 0
                    ? "No gateways found. Add your first gateway."
                    : "No gateways match your filter."}
                </TableCell>
              </TableRow>
            ) : (
              displayedGateways.map((gateway) => (
                <TableRow key={gateway.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{gateway.gateway_ID}</TableCell>
                  <TableCell className="font-medium">{gateway.gateway_name}</TableCell>
                  <TableCell>{gateway.tenant_name}</TableCell>
                  <TableCell>{gateway.application_name}</TableCell>
                  <TableCell>{gateway.gateway_stats_interval}s</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(gateway)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(gateway.id)}>
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
            <DialogTitle>{editingGateway ? "Edit Gateway" : "Add New Gateway"}</DialogTitle>
            <DialogDescription>
              Enter gateway and application details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant_name">Tenant Name *</Label>
                <Input
                  id="tenant_name"
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  placeholder="Enterprise 1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gateway_name">Gateway Name *</Label>
                <Input
                  id="gateway_name"
                  value={formData.gateway_name}
                  onChange={(e) => setFormData({ ...formData, gateway_name: e.target.value })}
                  placeholder="Roof Gateway"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gateway_ID">Gateway ID *</Label>
                <Input
                  id="gateway_ID"
                  value={formData.gateway_ID}
                  onChange={(e) => setFormData({ ...formData, gateway_ID: e.target.value })}
                  placeholder="GW-2024-001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application_name">Application Name *</Label>
                <Input
                  id="application_name"
                  value={formData.application_name}
                  onChange={(e) => setFormData({ ...formData, application_name: e.target.value })}
                  placeholder="Smart Factory"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application_description">Application Description</Label>
                <Input
                  id="application_description"
                  value={formData.application_description}
                  onChange={(e) => setFormData({ ...formData, application_description: e.target.value })}
                  placeholder="Description of the application"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gateway_stats_interval">Stats Interval (s)</Label>
                  <Input
                    id="gateway_stats_interval"
                    value={formData.gateway_stats_interval}
                    onChange={(e) => setFormData({ ...formData, gateway_stats_interval: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="application_tags">Tags</Label>
                  <Input
                    id="application_tags"
                    value={formData.application_tags}
                    onChange={(e) => setFormData({ ...formData, application_tags: e.target.value })}
                    placeholder="factory, production"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingGateway ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
