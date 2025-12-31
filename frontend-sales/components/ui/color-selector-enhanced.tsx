"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";

interface GarmentColor {
  id: number;
  color_name: string;
  color_code: string;
  color_ref: string | null;
  category: string | null;
  is_active: boolean;
}

interface ColorSelectorEnhancedProps {
  value?: string;
  onValueChange: (colorName: string, colorCode: string, colorRef: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const COLOR_CATEGORIES = [
  "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Neutral", "Brown", "Beige", "Other"
];

export function ColorSelectorEnhanced({
  value,
  onValueChange,
  placeholder = "Select color...",
  disabled = false,
  className,
}: ColorSelectorEnhancedProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [colors, setColors] = React.useState<GarmentColor[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [newColor, setNewColor] = React.useState({
    color_name: "",
    color_code: "#000000",
    color_ref: "",
    category: "Other",
  });

  // Load colors from API
  const loadColors = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.colors.getAll();
      setColors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load colors:", error);
      // Fallback: try to seed defaults if empty
      try {
        await api.colors.seedDefaults();
        const data = await api.colors.getAll();
        setColors(Array.isArray(data) ? data : []);
      } catch {
        setColors([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadColors();
  }, [loadColors]);

  // Filter colors based on search
  const filteredCategories = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    const categorizedColors: Record<string, GarmentColor[]> = {};

    colors.forEach(color => {
      if (search && !color.color_name.toLowerCase().includes(searchLower) &&
          !(color.color_ref?.toLowerCase().includes(searchLower))) {
        return;
      }

      const category = color.category || "Other";
      if (!categorizedColors[category]) {
        categorizedColors[category] = [];
      }
      categorizedColors[category].push(color);
    });

    return Object.entries(categorizedColors)
      .filter(([_, colors]) => colors.length > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [colors, search]);

  const selectedColor = React.useMemo(() => {
    return colors.find(c => c.color_name === value);
  }, [colors, value]);

  const handleAddColor = async () => {
    if (!newColor.color_name.trim()) {
      toast.error("Color name is required");
      return;
    }
    if (!newColor.color_code.trim()) {
      toast.error("Color code (hex) is required");
      return;
    }

    try {
      setAdding(true);
      const created = await api.colors.create({
        color_name: newColor.color_name.trim(),
        color_code: newColor.color_code.trim(),
        color_ref: newColor.color_ref.trim() || null,
        category: newColor.category,
        is_active: true,
      });

      toast.success(`Color "${created.color_name}" added successfully`);
      setColors(prev => [...prev, created]);
      onValueChange(created.color_name, created.color_code, created.color_ref || "");
      setShowAddDialog(false);
      setOpen(false);
      setNewColor({ color_name: "", color_code: "#000000", color_ref: "", category: "Other" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add color");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn("w-full justify-between", className)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedColor ? (
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: selectedColor.color_code }}
                />
                <span className="truncate">{selectedColor.color_name}</span>
                {selectedColor.color_ref && (
                  <span className="text-xs text-muted-foreground">({selectedColor.color_ref})</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Search colors or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              {filteredCategories.length === 0 && !loading && (
                <CommandEmpty>No color found.</CommandEmpty>
              )}
              {filteredCategories.map(([category, categoryColors]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryColors.map((color) => (
                    <CommandItem
                      key={color.id}
                      value={color.color_name}
                      onSelect={() => {
                        onValueChange(
                          color.color_name,
                          color.color_code,
                          color.color_ref || ""
                        );
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === color.color_name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div
                        className="mr-2 h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: color.color_code }}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{color.color_name}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{color.color_code}</span>
                          {color.color_ref && <span>| {color.color_ref}</span>}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-primary"
                onClick={() => {
                  setShowAddDialog(true);
                  setOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Color
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Add New Color Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Color</DialogTitle>
            <DialogDescription>
              Add a new color to the master list. It will be available for all style variants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="color_name">Color Name *</Label>
              <Input
                id="color_name"
                value={newColor.color_name}
                onChange={(e) => setNewColor(prev => ({ ...prev, color_name: e.target.value }))}
                placeholder="e.g., Navy Blue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color_code">Color Code (Hex) *</Label>
              <div className="flex gap-2">
                <Input
                  id="color_code"
                  type="color"
                  value={newColor.color_code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, color_code: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={newColor.color_code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, color_code: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color_ref">Color Reference (Pantone/Custom)</Label>
              <Input
                id="color_ref"
                value={newColor.color_ref}
                onChange={(e) => setNewColor(prev => ({ ...prev, color_ref: e.target.value }))}
                placeholder="e.g., 19-4052 or PANTONE 286 C"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newColor.category}
                onValueChange={(value) => setNewColor(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div
                className="h-12 w-12 rounded-lg border border-gray-300 shadow-sm"
                style={{ backgroundColor: newColor.color_code }}
              />
              <div>
                <div className="font-medium">{newColor.color_name || "Color Name"}</div>
                <div className="text-sm text-muted-foreground">
                  {newColor.color_code} {newColor.color_ref && `| ${newColor.color_ref}`}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColor} disabled={adding}>
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
