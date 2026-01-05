"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorOption, GARMENT_COLORS, getColorCategories, getColorsByCategory } from "@/lib/garment-colors";

interface ColorSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ColorSelector({
  value,
  onValueChange,
  placeholder = "Select color...",
  disabled = false,
  className,
}: ColorSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filter colors based on search
  const filteredCategories = React.useMemo(() => {
    try {
      const categories = getColorCategories();
      if (!Array.isArray(categories)) {
        console.error("getColorCategories() did not return an array");
        return [];
      }

      const searchLower = search.toLowerCase();

      const result = categories
        .map(category => {
          const allColors = getColorsByCategory(category);
          if (!Array.isArray(allColors)) {
            return null;
          }

          const colors = !search
            ? allColors
            : allColors.filter(color =>
                color?.name?.toLowerCase().includes(searchLower) ||
                color?.pantone?.toLowerCase().includes(searchLower)
              );

          return { category, colors };
        })
        .filter((group): group is { category: string; colors: ColorOption[] } =>
          group !== null && Array.isArray(group.colors) && group.colors.length > 0
        );

      return result;
    } catch (err) {
      console.error("Error in filteredCategories:", err);
      return [];
    }
  }, [search]);

  const selectedColor = React.useMemo(() => {
    if (!value || !Array.isArray(GARMENT_COLORS)) return undefined;
    return GARMENT_COLORS.find(color => color.name === value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {selectedColor ? (
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="truncate">{selectedColor.name}</span>
              {selectedColor.pantone && (
                <span className="text-xs text-muted-foreground">({selectedColor.pantone})</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search colors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {filteredCategories.length === 0 && (
              <CommandEmpty>No color found.</CommandEmpty>
            )}
            {filteredCategories.map((group) => {
              if (!group || !group.category || !Array.isArray(group.colors)) {
                return null;
              }
              return (
                <CommandGroup key={group.category} heading={group.category}>
                  {group.colors.map((color) => {
                    if (!color || !color.name) return null;
                    return (
                      <CommandItem
                        key={color.name}
                        value={color.name}
                        onSelect={() => {
                          onValueChange(value === color.name ? "" : color.name);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === color.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div
                          className="mr-2 h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color.hex || "#000000" }}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{color.name}</span>
                          {color.pantone && (
                            <span className="text-xs text-muted-foreground truncate">
                              {color.pantone}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
