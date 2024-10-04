import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface FilterConfig {
  key: string;
  type: "text" | "number" | "array";
  transformParams?: (value: any) => any;
  matchFn: (item: any, filterValue: any) => boolean;
}

interface UseFiltersProps {
  data: any[];
  filterConfig: FilterConfig[];
  searchMatchFn?: (item: any, searchValue: string) => boolean;
}

export function useFilters({
  data,
  filterConfig,
  searchMatchFn,
}: UseFiltersProps) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const searchParams = useSearchParams();

  // Initialize filters from search params
  const initializeFilters = useCallback(() => {
    return filterConfig.reduce(
      (acc: Record<string, any>, { key, transformParams }) => {
        const searchValue = searchParams.get(key);
        const initialValue = searchValue ? searchValue.split(",") : [];
        acc[key] = transformParams
          ? transformParams(initialValue)
          : initialValue;
        return acc;
      },
      {}
    );
  }, [searchParams, filterConfig]);

  const [filters, setFilters] = useState(initializeFilters);

  useEffect(() => {
    const applyFilters = () => {
      const searchLower = search?.toLowerCase() || "";

      return data.filter((item) => {
        if (
          search &&
          !(searchMatchFn
            ? searchMatchFn(item, searchLower)
            : item.name?.toLowerCase().includes(searchLower))
        ) {
          return false;
        }

        for (const { key, matchFn } of filterConfig) {
          const filterValue = filters[key];
          if (filterValue.length && !matchFn(item, filterValue)) {
            return false;
          }
        }

        return true;
      });
    };

    const filtered = applyFilters();

    // Only update state if filtered data is different
    if (
      filtered.length !== filteredData.length ||
      filtered.some((item, index) => item !== filteredData[index])
    ) {
      setFilteredData(filtered);
    }
  }, [data, search, filters, searchMatchFn, filterConfig]);

  return {
    search,
    setSearch,
    filters,
    setFilters,
    data: filteredData,
    count: Object.values(filters).filter((v: any) => v.length).length,
  };
}
