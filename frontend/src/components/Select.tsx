"use client";

import {
  SelectContent,
  SelectItem,
  Select as SelectMain,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectProps {
  data: { id: string; name: string }[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function Select({
  data,
  placeholder,
  value,
  onValueChange,
}: SelectProps) {
  return (
    <SelectMain onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectMain>
  );
}
