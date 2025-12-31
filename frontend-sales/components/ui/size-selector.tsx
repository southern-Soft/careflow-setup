"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GARMENT_SIZES } from "@/lib/garment-colors";

interface SizeSelectorProps {
  value?: string[]; // Array of selected size values
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelections?: number;
}

export function SizeSelector({
  value = [],
  onValueChange,
  placeholder = "Select sizes...",
  disabled = false,
  className,
  maxSelections,
}: SizeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const toggleSize = (sizeValue: string) => {
    const currentIndex = value.indexOf(sizeValue);
    let newValue: string[];

    if (currentIndex === -1) {
      // Add size if not already selected and within max limit
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max reached
      }
      newValue = [...value, sizeValue];
    } else {
      // Remove size
      newValue = value.filter((v) => v !== sizeValue);
    }

    onValueChange(newValue);
  };

  const removeSize = (sizeValue: string) => {
    onValueChange(value.filter((v) => v !== sizeValue));
  };

  const clearAll = () => {
    onValueChange([]);
  };

  const selectedLabels = value
    .map(v => GARMENT_SIZES.find(s => s.value === v)?.label || v)
    .join(", ");

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-auto min-h-[40px] py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {value.slice(0, 3).map((sizeValue) => {
                    const size = GARMENT_SIZES.find(s => s.value === sizeValue);
                    return (
                      <Badge
                        key={sizeValue}
                        variant="secondary"
                        className="gap-1"
                      >
                        {size?.value || sizeValue}
                      </Badge>
                    );
                  })}
                  {value.length > 3 && (
                    <Badge variant="secondary">
                      +{value.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Select Sizes</h4>
              {value.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            {maxSelections && (
              <p className="text-xs text-muted-foreground">
                {value.length} / {maxSelections} selected
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {GARMENT_SIZES.map((size) => {
                const isSelected = value.includes(size.value);
                const isDisabled = !isSelected && !!maxSelections && value.length >= maxSelections;

                return (
                  <Button
                    key={size.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size.value)}
                    disabled={isDisabled}
                    className={cn(
                      "justify-between h-8 text-xs",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    <span>{size.value}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </Button>
                );
              })}
            </div>

            {value.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs font-medium mb-2">Selected:</p>
                <div className="flex flex-wrap gap-1">
                  {value.map((sizeValue) => {
                    const size = GARMENT_SIZES.find(s => s.value === sizeValue);
                    return (
                      <Badge
                        key={sizeValue}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-secondary/80"
                        onClick={() => removeSize(sizeValue)}
                      >
                        {size?.value || sizeValue}
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
