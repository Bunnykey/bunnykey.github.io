"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { debounce } from "@/lib/utils";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchFilter({
  onSearch,
  placeholder = "Search posts...",
}: SearchFilterProps) {
  const [value, setValue] = useState("");

  // Debounced search callback
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="relative">
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className="pl-10"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
