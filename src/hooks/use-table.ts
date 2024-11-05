import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';

interface TableOptions {
  selectColumnFilter?: string;
  columnVisibility?: VisibilityState;
  columnFilters?: ColumnFiltersState;
  rowSelection?: Record<string, boolean>;
  sorting?: SortingState;
  pagination?: { pageIndex: number; pageSize: number };
}

export function useTable({
  columns = [],
  queryObj = {},
  options = {},
}: {
  columns: any[];
  queryObj: any;
  options?: TableOptions;
}) {
  const searchParams = useSearchParams();

  // State variables with default values from options
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    options.columnVisibility || {},
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    options.columnFilters || [],
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    options.rowSelection || {},
  );
  const [sorting, setSorting] = useState<SortingState>(options.sorting || []);
  const [pagination, setPagination] = useState(
    options.pagination || { pageIndex: 0, pageSize: 10 },
  );
  const [selectColumnFilter, setSelectColumnFilter] = useState(
    options.selectColumnFilter || '',
  );

  const query = useQuery({
    ...queryObj,
    queryKey: [queryObj.queryKey, pagination, columnFilters, sorting],
  });

  const table = useReactTable({
    data: Array.isArray(query.data) ? query.data : [],
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return {
    table,
    query,
    sorting,
    pagination,
    columnFilters,
    selectColumnFilter,
    setSelectColumnFilter,
  };
}
