'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
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
import { ArrowUpDown, Eye, Logs } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import LoadingScreen from '@/components/shared/loading-screen';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { Badge } from '@/components/ui/badge';
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
import { useProjectStore } from '@/stores/project';
import { LOGS_TYPES_COLORS } from '@/utils/constants';
import { time } from '@/utils/generic';

const isJson = (notes: string) => {
  try {
    JSON.parse(notes);
    return true;
  } catch {
    return false;
  }
};

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
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: 'type',
    title: 'Type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <Badge
        className={cn(
          //@ts-ignore
          LOGS_TYPES_COLORS[row.original.type],
          'pointer-events-none rounded-full text-white',
        )}
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: 'function',
    title: 'Function',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Function" />,
  },
  {
    accessorKey: 'notes',
    title: 'Notes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
    cell: ({ row }) => (
      <div className="max-h-14 overflow-hidden text-wrap">{row.getValue('notes')}</div>
    ),
  },
  {
    accessorKey: 'created_at',
    title: 'Created At',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {format(row.getValue('created_at'), 'dd-MM-yyyy HH:mm:ss')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex justify-end space-x-2">
        <Dialog>
          <DialogTrigger>
            <Button variant="ghost" size="sm">
              <Eye className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-96 sm:max-w-2xl">
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-yellow-400" />
                <span>{row.original.function}</span>
              </DialogTitle>
              <DialogDescription>
                {time.timeAgo(row.original.created_at)} -{' '}
                {format(row.original.created_at, 'dd-MM-yyyy HH:mm:ss')}
              </DialogDescription>
            </DialogHeader>
            <span className="h-96 max-h-96 overflow-auto whitespace-pre-wrap">
              {isJson(row.original.notes) ? (
                <JsonViewer
                  value={JSON.parse(row.original.notes)}
                  theme="dark"
                  displayDataTypes={false}
                  rootName={false}
                  collapseStringsAfterLength={20}
                />
              ) : (
                row.original.notes
              )}
            </span>
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
];

export default function Page({ params }: { params: { username: string } }) {
  const { project } = useProjectStore();
  const [data, setData] = useState<any[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
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

  const queryLogs = useQuery<any>({
    queryKey: ['logs', project?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('projectId', project?.id)
        .order('created_at', { ascending: false });
      setData(data || []);
      return data;
    },
  });

  useEffect(() => {
    const changes = supabase
      .channel('table-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `projectId=eq.${project?.id}`,
        },
        (payload) => setData((prev) => [payload.new, ...prev]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, [project?.id]);

  return (
    <>
      {!project && <LoadingScreen />}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 pb-10 text-xs">
          <Logs className="size-6" />
          <TypographyH1>Logs</TypographyH1>
          <div className="ml-auto">
            <Button
              onClick={async () => {
                navigator.clipboard.writeText(`
logMap = Map();
logMap.put("projectId",90);
logMap.put("type",""); // valid types: [success, error, warning, info]
logMap.put("function","dsadasdsa");
logMap.put("notes","");
responseLog = postUrl("https://lobaadmin-zohofunctionstogit.vercel.app/api/logs", logMap.toString());
`);

                toast.success('Text Copied');
              }}
            >
              Copy Text
            </Button>
          </div>
        </div>
        {/* table */}
        <div className="">
          <div className="flex items-center py-4">
            <Input
              className="max-w-sm"
              placeholder="Filter by function name..."
              value={(table.getColumn('function')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('function')?.setFilterValue(event.target.value)
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Toggle columns"
                  variant="outline"
                  size="sm"
                  className="ml-auto hidden h-8 lg:flex"
                >
                  <MixerHorizontalIcon className="mr-2 size-4" />
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
                      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        <span className="truncate">{column.id}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
