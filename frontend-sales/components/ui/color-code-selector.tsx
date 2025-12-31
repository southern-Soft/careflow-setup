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
import { ColorOption, getColorCodes } from "@/lib/garment-colors";

interface ColorCodeSelectorProps {
  colorName?: string; // The selected color name to filter codes
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ColorCodeSelector({
  colorName,
  value,
  onValueChange,
  placeholder = "Select color code...",
  disabled = false,
  className,
}: ColorCodeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Get all color codes that match the selected color name
  const availableCodes = React.useMemo(() => {
    if (!colorName) return [];
    return getColorCodes(colorName);
  }, [colorName]);

  // Filter codes based on search
  const filteredCodes = React.useMemo(() => {
    if (!search) return availableCodes;

    const searchLower = search.toLowerCase();
    return availableCodes.filter(code =>
      code.name.toLowerCase().includes(searchLower) ||
      code.pantone?.toLowerCase().includes(searchLower) ||
      code.hex.toLowerCase().includes(searchLower)
    );
  }, [search, availableCodes]);

  const selectedCode = availableCodes.find(code => code.pantone === value || code.hex === value);

  // Reset value when color name changes
  React.useEffect(() => {
    if (colorName && value) {
      const isValidCode = availableCodes.some(code => code.pantone === value || code.hex === value);
      if (!isValidCode) {
        onValueChange("");
      }
    }
  }, [colorName, value, availableCodes, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !colorName}
          className={cn("w-full justify-between", className)}
        >
          {selectedCode ? (
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                style={{ backgroundColor: selectedCode.hex }}
              />
              <span className="truncate">{selectedCode.pantone || selectedCode.hex}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {!colorName ? "Select color first..." : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search color codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {filteredCodes.length === 0 && (
              <CommandEmpty>
                {!colorName ? "Please select a color first" : "No color codes found"}
              </CommandEmpty>
            )}
            {filteredCodes.length > 0 && (
              <CommandGroup heading={`${colorName} Color Codes`}>
                {filteredCodes.map((code) => {
                  const codeValue = code.pantone || code.hex;
                  return (
                    <CommandItem
                      key={codeValue}
                      value={codeValue}
                      onSelect={() => {
                        onValueChange(value === codeValue ? "" : codeValue);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === codeValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div
                        className="mr-2 h-5 w-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: code.hex }}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">
                          {code.pantone || "Custom"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {code.hex}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
