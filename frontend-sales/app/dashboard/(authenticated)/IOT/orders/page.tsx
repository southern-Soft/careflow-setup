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
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<any[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "", client_name: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    order_name: "",
    order_desc: "",
    client_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadOrders();
    loadClients();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load clients:", error);
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", client_name: "" });
  };

  useEffect(() => {
    let result = [...orders];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (order: any) =>
          order.order_id?.toLowerCase().includes(searchLower) ||
          order.order_name?.toLowerCase().includes(searchLower) ||
          order.client_name?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.client_name && filters.client_name !== "all") {
      result = result.filter((order: any) => order.client_name === filters.client_name);
    }
    setFilteredOrders(result);
  }, [orders, filters]);

  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedOrders(filteredOrders);
    } else {
      setDisplayedOrders(filteredOrders.slice(0, rowLimit));
    }
  }, [filteredOrders, rowLimit]);

  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      if (!editingOrder) resetForm();
      setIsDialogOpen(true);
    } else {
      setIsDialogOpen(false);
      setEditingOrder(null);
    }
  };

  const handleClientChange = (clientName: string) => {
    const selectedClient = clients.find(c => c.client_name === clientName);
    if (selectedClient) {
      setFormData({
        ...formData,
        client_name: clientName,
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
        address: selectedClient.address || "",
      });
    } else {
      setFormData({ ...formData, client_name: clientName });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await api.orders.update(editingOrder.id, formData);
        toast.success("Order updated successfully");
      } else {
        await api.orders.create(formData);
        toast.success("Order created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadOrders();
    } catch (error: any) {
      console.error("Failed to save order:", error);
      toast.error(error.message || "Failed to save order");
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      order_name: order.order_name || "",
      order_desc: order.order_desc || "",
      client_name: order.client_name || "",
      email: order.email || "",
      phone: order.phone || "",
      address: order.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await api.orders.delete(id);
        toast.success("Order deleted successfully");
        loadOrders();
      } catch (error) {
        toast.error("Failed to delete order");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingOrder(null);
    setFormData({
      order_name: "",
      order_desc: "",
      client_name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const exportColumns: ExportColumn[] = [
    { key: "order_id", header: "Order ID" },
    { key: "order_name", header: "Order Name" },
    { key: "client_name", header: "Client" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "created_at", header: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage customer orders. ID will be auto-generated.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredOrders}
            columns={exportColumns}
            filename="orders"
            sheetName="Orders"
          />
          <Button onClick={() => handleDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <Select
            value={filters.client_name || "all"}
            onValueChange={(val) => setFilters({ ...filters, client_name: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.client_name}>{c.client_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <TableHead>Order ID</TableHead>
              <TableHead>Order Name</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {orders.length === 0
                    ? "No orders found. Create your first order."
                    : "No orders match your filter."}
                </TableCell>
              </TableRow>
            ) : (
              displayedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{order.order_id}</TableCell>
                  <TableCell className="font-medium">{order.order_name}</TableCell>
                  <TableCell>{order.client_name}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Edit Order" : "Add New Order"}</DialogTitle>
            <DialogDescription>
              Enter order details below. Order ID is auto-generated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order_name">Order Name *</Label>
                  <Input
                    id="order_name"
                    value={formData.order_name}
                    onChange={(e) => setFormData({ ...formData, order_name: e.target.value })}
                    placeholder="Spring 2025 Collection"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client_dropdown">Select Client *</Label>
                  <Select
                    value={formData.client_name}
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger id="client_dropdown">
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.client_name}>{c.client_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order_desc">Description</Label>
                <Textarea
                  id="order_desc"
                  value={formData.order_desc}
                  onChange={(e) => setFormData({ ...formData, order_desc: e.target.value })}
                  placeholder="Bulk order for shirts..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Client Email (Auto-filled)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Client Phone (Auto-filled)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Shipping Address (Auto-filled)</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingOrder ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
