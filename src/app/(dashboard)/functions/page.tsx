'use client';

import React, { useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { JsonViewer } from '@textea/json-viewer';
import { format } from 'date-fns';
import { CirclePlus, Edit, Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import BadgeApplication from '@/components/shared/badge-application';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGlobalStore } from '@/stores/global';
import { APPLICATIONS } from '@/utils/constants';

type ColumnDefExtended<TData = any> = ColumnDef<TData> & {
  title?: string;
};

const columns: ColumnDefExtended<any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'applications',
    title: 'Applications',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applications" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-start gap-2">
        {row.original.applications.map((app: any) => (
          <BadgeApplication key={app} application={app} />
        ))}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      return row.original.applications.some((app: any) =>
        filterValue.includes(app),
      );
    },
  },
  {
    accessorKey: 'name',
    title: 'Name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'updated_at',
    title: 'Updated At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {format(row.getValue('created_at'), 'dd-MM-yyyy HH:mm:ss')}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    title: 'Created At',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {format(row.getValue('created_at'), 'dd-MM-yyyy HH:mm:ss')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/functions/${row.original.id}`}>
            <DropdownMenuItem>View function</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Page() {
  const { functions } = useGlobalStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});

  const table = useReactTable({
    data: functions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="">
      <div className="flex items-center gap-4 pb-10 text-xs">
        <TypographyH1>Functions</TypographyH1>
        <Link href="functions/create" className="ml-auto">
          <Button>
            <CirclePlus className="size-4" />
            New function
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="max-w-sm"
          placeholder="Filter by function name..."
          value={
            (table.getColumn('name')?.getFilterValue() as string) ??
            ''
          }
          onChange={(event) =>
            table
              .getColumn('name')
              ?.setFilterValue(event.target.value)
          }
        />

        <DataTableFacetedFilter
          key="applications"
          title="Applications"
          column={table.getColumn('applications')}
          options={APPLICATIONS}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Toggle columns"
              variant="outline"
              className="ml-auto hidden lg:flex"
            >
              <MixerHorizontalIcon className="size-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== 'undefined' &&
                  column.getCanHide(),
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    <span className="truncate">{column.id}</span>
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-2 text-xs" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
