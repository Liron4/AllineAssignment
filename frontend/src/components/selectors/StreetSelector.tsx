"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

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

export interface Street {
  id: number;
  name: string;
  citySymbol: number;
}

interface StreetSelectorProps {
  streets: Street[];
  selectedStreet: Street | null;
  onSelect: (street: Street | null) => void;
  hasSelectedCity: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function StreetSelector({
  streets,
  selectedStreet,
  onSelect,
  hasSelectedCity,
  isLoading = false,
  disabled = false,
}: StreetSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter streets based on search
  const filteredStreets = React.useMemo(() => {
    if (!searchValue) return streets.slice(0, 100); // Show first 100 by default
    const search = searchValue.toLowerCase();
    return streets
      .filter((street) => street.name.toLowerCase().includes(search))
      .slice(0, 100);
  }, [streets, searchValue]);

  const isDisabled = disabled || streets.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isDisabled}
          className="w-full justify-between text-right"
          dir="rtl"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              טוען רחובות...
            </span>
          ) : selectedStreet ? (
            selectedStreet.name
          ) : streets.length === 0 ? (
            hasSelectedCity ? "אין מידע על רחובות בעיר הזו" : "אנא בחר עיר תחילה"
          ) : (
            "בחר רחוב..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" dir="rtl">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="חפש רחוב..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>לא נמצאו רחובות.</CommandEmpty>
            <CommandGroup>
              {filteredStreets.map((street) => (
                <CommandItem
                  key={street.id}
                  value={street.id.toString()}
                  onSelect={() => {
                    onSelect(street.id === selectedStreet?.id ? null : street);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedStreet?.id === street.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {street.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
