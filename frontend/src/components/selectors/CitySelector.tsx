"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

export interface City {
  symbol: number;
  name: string;
}

interface CitySelectorProps {
  cities: City[];
  selectedCity: City | null;
  onSelect: (city: City | null) => void;
  disabled?: boolean;
}

export function CitySelector({
  cities,
  selectedCity,
  onSelect,
  disabled = false,
}: CitySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter cities based on search
  const filteredCities = React.useMemo(() => {
    if (!searchValue) return cities.slice(0, 100); // Show first 100 by default
    const search = searchValue.toLowerCase();
    return cities
      .filter((city) => city.name.toLowerCase().includes(search))
      .slice(0, 100);
  }, [cities, searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between text-right"
          dir="rtl"
        >
          {selectedCity ? selectedCity.name : "בחר עיר..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" dir="rtl">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="חפש עיר..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>לא נמצאו ערים.</CommandEmpty>
            <CommandGroup>
              {filteredCities.map((city) => (
                <CommandItem
                  key={city.symbol}
                  value={city.symbol.toString()}
                  onSelect={() => {
                    onSelect(city.symbol === selectedCity?.symbol ? null : city);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedCity?.symbol === city.symbol
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
