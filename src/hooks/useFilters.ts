import { useCallback, useEffect, useState } from 'react';

import { searchMatches } from '@/types/types';
import { useSearchParams } from 'next/navigation';

interface FilterConfig {
  key: string;
  type: 'text' | 'number' | 'array';
  transformParams?: (value: any) => any;
  matchFn: (item: any, filterValue: any) => boolean;
}

interface UseFiltersProps {
  data: any[] | undefined;
  filterConfig: FilterConfig[];
  searchMatchFn?: (item: any, searchValue: string) => boolean;
}

export function useFilters({ data = [], filterConfig, searchMatchFn }: UseFiltersProps) {
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const searchParams = useSearchParams();

  const initializeFilters = useCallback(() => {
    return filterConfig.reduce((acc: Record<string, any>, { key, transformParams }) => {
      const searchValue = searchParams.get(key);
      const initialValue = searchValue ? searchValue.split(',') : [];
      acc[key] = transformParams ? transformParams(initialValue) : initialValue;
      return acc;
    }, {});
  }, [searchParams, filterConfig]);

  const [filters, setFilters_] = useState(initializeFilters);
  const setFilters = (updates: { [key: string]: any }) => {
    setFilters_((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      return data.filter((item) => {
        if (
          search &&
          !(searchMatchFn
            ? searchMatchFn(item, search || '')
            : item.name?.toLowerCase().includes(search?.toLowerCase() || ''))
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
    if (filtered.length !== filteredData.length || filtered.some((item, index) => item !== filteredData[index])) {
      setFilteredData(filtered);
    }
  }, [data, search, filters, searchMatchFn, filterConfig]);

  // search match
  const [searchMatches, setSearchMatches_] = useState<searchMatches>({});

  const setSearchMatches = (updates: { [key: string]: any }) => {
    setSearchMatches_((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return {
    search,
    setSearch,
    filters,
    setFilters,
    data: filteredData,
    searchMatches,
    setSearchMatches,
    filtersCount: Object.values(filters).filter((v: any) => v.length).length,
  };
}
