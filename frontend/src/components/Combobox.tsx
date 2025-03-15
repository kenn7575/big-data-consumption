"use client";

import { useState } from "react";

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

import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown } from "lucide-react";

interface ComboboxProps {
  values: { label: string; value: string }[];
  selected?: string[];
  setSelected?: (value: string[]) => void;
  noSelectedPlaceholder?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onSelect?: (value: string) => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
  multiselect?: boolean;
}

export function Combobox({
  values,
  selected,
  setSelected,
  noSelectedPlaceholder = "Select",
  searchPlaceholder = "Search",
  onSearch = () => {},
  onSelect = () => {},
  closeOnSelect = false,
  disabled = false,
  multiselect = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(currentValue: string) {
    onSelect(currentValue);
    if (!setSelected || !selected) return;

    if (!multiselect) {
      setSelected([currentValue]);

      if (closeOnSelect) setOpen(false);

      return;
    }

    if (!selected.includes(currentValue)) {
      setSelected(
        [...selected, currentValue].sort((a, b) => a.localeCompare(b)),
      );
    } else {
      setSelected(selected.filter((v) => v !== currentValue));
    }

    if (closeOnSelect) setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected?.length ? selected.join(", ") : noSelectedPlaceholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={onSearch}
          />
          <CommandList>
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {values.map((value) => (
                <CommandItem
                  disabled={disabled && !selected?.includes(value.value)}
                  key={value.value}
                  value={value.value}
                  onSelect={(currentValue) => {
                    handleSelect(currentValue);
                  }}
                >
                  {value.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selected?.includes(value.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
