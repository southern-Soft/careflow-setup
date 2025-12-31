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
import { generateSclPo } from "@/services/utils";
import { ID_CONFIG } from "@/lib/config";

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<any[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "", season: "", buyer: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    order_no: "",
    order_category: "",
    sales_contract: "",
    scl_po: "",
    fob: "",
    note: "",
  });

  useEffect(() => {
    loadOrders();

  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    }
  };



  // Clear filters function
  const clearFilters = () => {
    setFilters({ search: "", season: "", buyer: "" });
  };

  // Apply filters
  useEffect(() => {
    let result = [...orders];

    // Search filter - search across multiple fields
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (order: any) =>
          order.order_no?.toLowerCase().includes(searchLower) ||
          order.sales_contract?.toLowerCase().includes(searchLower) ||
          order.scl_po?.toLowerCase().includes(searchLower)
      );
    }



    setFilteredOrders(result);
  }, [orders, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedOrders(filteredOrders);
    } else {
      setDisplayedOrders(filteredOrders.slice(0, rowLimit));
    }
  }, [filteredOrders, rowLimit]);


  const handleDialogOpen = async (isOpen: boolean) => {
    if (isOpen) {
      resetForm(); // Reset form first
      setIsDialogOpen(true);

      // Auto-generate SCL PO for new orders
      // We do this AFTER opening dialog so user sees it loading/appearing
      const allOrders = await api.orders.getAll();
      const newSclPo = generateSclPo(Array.isArray(allOrders) ? allOrders : []);
      setFormData(prev => ({ ...prev, scl_po: newSclPo }));
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        fob: formData.fob ? parseFloat(formData.fob) : null,
      };

      if (editingOrder) {
        await api.orders.update(editingOrder.id, submitData);
        toast.success("Order updated successfully");
      } else {
        await api.orders.create(submitData);
        toast.success("Order created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadOrders();
    } catch (error: any) {
      console.error("Failed to save order:", error);
      toast.error(error.detail || "Failed to save order");
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      order_no: order.order_no,
      order_category: order.order_category || "",
      sales_contract: order.sales_contract || "",
      scl_po: order.scl_po || "",
      fob: order.fob ? order.fob.toString() : "",
      note: order.note || "",
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
      order_no: "",
      order_category: "",
      sales_contract: "",
      scl_po: "",
      fob: "",
      note: "",
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "order_no", header: "Order No" },
    { key: "order_category", header: "Order Category" },
    { key: "sales_contract", header: "Sales Contract" },
    { key: "scl_po", header: "SCL PO" },
    { key: "fob", header: "FOB", transform: (value) => value ? `$${value.toFixed(2)}` : "-" },
    { key: "note", header: "Note" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Info</h1>
          <p className="text-muted-foreground">
            Create and manage customer orders with basic information
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredOrders}
            columns={exportColumns}
            filename="orders"
            sheetName="Orders"
          />
          <Button
            onClick={() => handleDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order number, contract, SCL PO..."
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
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {displayedOrders.length} of {filteredOrders.length} filtered ({orders.length} total) orders
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No</TableHead>
              <TableHead>Order Category</TableHead>
              <TableHead>Sales Contract</TableHead>
              <TableHead>SCL PO</TableHead>
              <TableHead>FOB</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {orders.length === 0
                    ? "No orders found. Create your first order to get started."
                    : "No orders match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-mono">{order.order_no}</TableCell>
                  <TableCell>{order.season}</TableCell>
                  <TableCell>{order.order_category}</TableCell>
                  <TableCell>{order.sales_contract}</TableCell>
                  <TableCell>{order.scl_po}</TableCell>
                  <TableCell>${order.fob?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? "Edit Order" : "Add New Order"}
            </DialogTitle>
            <DialogDescription>
              Fill in the order basic information below. SCL PO will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order_no">Order No *</Label>
                  <Input
                    id="order_no"
                    value={formData.order_no}
                    onChange={(e) =>
                      setFormData({ ...formData, order_no: e.target.value })
                    }
                    placeholder="ORD-2025-001"
                    required
                  />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order_category">Order Category</Label>
                  <Select
                    value={formData.order_category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, order_category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Sample">Sample</SelectItem>
                      <SelectItem value="Repeat">Repeat</SelectItem>
                      <SelectItem value="Export">Export</SelectItem>
                      <SelectItem value="Domestic">Domestic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sales_contract">Sales Contract</Label>
                  <Input
                    id="sales_contract"
                    value={formData.sales_contract}
                    onChange={(e) =>
                      setFormData({ ...formData, sales_contract: e.target.value })
                    }
                    placeholder="SC-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scl_po">SCL PO (Auto-Generated)</Label>
                  <Input
                    id="scl_po"
                    value={formData.scl_po}
                    disabled
                    className="font-mono font-bold bg-muted"
                    placeholder={`${ID_CONFIG.PO_PREFIX}_25_0001`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: {ID_CONFIG.PO_PREFIX}_YY_0001
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fob">FOB</Label>
                  <Input
                    id="fob"
                    type="number"
                    step="0.01"
                    value={formData.fob}
                    onChange={(e) =>
                      setFormData({ ...formData, fob: e.target.value })
                    }
                    placeholder="25.50"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingOrder ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
