'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { queryClient } from '@/providers/react-query';
import { useTheme } from '@/providers/theme';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { useVirtualizer } from '@tanstack/react-virtual';
import { JsonViewer } from '@textea/json-viewer';
import { format } from 'date-fns';
import { ArrowUpDown, Check, Eye, Logs } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import LoadingScreen from '@/components/shared/loading-screen';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ButtonLoading from '@/components/ui/button-loading';
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
import { LOGS_TYPES, LOGS_TYPES_COLORS } from '@/utils/constants';
import { time, type } from '@/utils/generic';

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
    accessorKey: 'type',
    title: 'Type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge
        className="pointer-events-none rounded-full text-white shadow-none"
        style={{
          // @ts-ignore
          backgroundColor: `rgb(${LOGS_TYPES_COLORS[row.original.type]})`,
        }}
      >
        {row.original.type}
      </Badge>
    ),
    filterFn: (row, columnId, filterValues) => {
      // Apply 'or' filtering logic
      return filterValues.some(
        (val: any) => row.getValue(columnId) === val,
      );
    },
  },
  {
    accessorKey: 'function',
    title: 'Function',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Function" />
    ),
  },
  {
    accessorKey: 'notes',
    title: 'Notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <div className="max-h-14 max-w-[500px] overflow-hidden break-words">
        {row.getValue('notes')}
      </div>
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
  // {
  //   id: 'actions',
  //   cell: ({ row }: any) => (
  //     <div className="flex justify-end space-x-2">
  //       <Button onClick={() => setViewRow(row)} variant="ghost" size="sm">
  //         <Eye className="size-4" />
  //       </Button>
  //     </div>
  //   ),
  // },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-96 sm:max-w-2xl">
          <DialogHeader className="border-b pb-2">
            <DialogTitle>
              <div
                className="mr-2 inline-flex size-2 rounded-full"
                style={{
                  backgroundColor: `rgb(${LOGS_TYPES_COLORS[row.original.type]})`,
                }}
              />
              <span>{row.original.function}</span>
            </DialogTitle>
            <DialogDescription>
              {time.timeAgo(row.original.created_at)} -{' '}
              {format(row.original.created_at, 'dd-MM-yyyy HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>
          <span className="h-96 max-h-96 overflow-auto whitespace-pre-wrap">
            {type.isJson(row.original.notes) ? (
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
    ),
  },
];

export default function Page({
  params,
}: {
  params: { username: string };
}) {
  const { theme } = useTheme();
  const { project } = useProjectStore();
  const [recentItemIds, setRecentItemIds] = useState<string[]>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const queryLogs = useQuery<any>({
    queryKey: ['logs', project?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('projectUsername', project?.username)
        .order('created_at', { ascending: false });
      return data;
    },
  });

  const table = useReactTable({
    data: queryLogs.data || [],
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

  // const parentRef = useRef<any>();
  // const rowVirtualizer = useVirtualizer({
  //   count: 10000,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 35,
  // });

  const mutationDeleteLogs = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('projectUsername', project?.username);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      toast.success('All logs deleted successfully.');
      queryLogs.refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating function');
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
          filter: `projectUsername=eq.${project?.username}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['logs', project?.id],
            (prev: any[]) => {
              console.log(payload.new);

              console.log({ prev });

              return [payload.new, ...prev];
            },
          );

          setRecentItemIds((prev) => [...prev, payload.new.id]);
          setTimeout(() => {
            setRecentItemIds((prev) =>
              prev.filter((id) => id !== payload.new.id),
            );
          }, 2000);
        },
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
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={async () => {
                navigator.clipboard.writeText(`
logMap = Map();
logMap.put("projectUsername", "${project?.username}");
logMap.put("type",""); // valid types: [success, error, warning, info]
logMap.put("function","dsadasdsa");
logMap.put("notes","");
responseLog = postUrl("https://lobaadmin-zohofunctionstogit.vercel.app/api/logs", logMap.toString());
`);

                toast.success('Deluge Code Copied');
              }}
            >
              Deluge
            </Button>
            <Button
              onClick={async () => {
                navigator.clipboard.writeText(`
const logMap = {
  projectUsername: "${project?.username}",
  type: "", // valid types: [success, error, warning, info]
  function: "dsadasdsa",
  notes: ""
};

const response = await axios.post("https://lobaadmin-zohofunctionstogit.vercel.app/api/logs", logMap);
`);

                toast.success('Axios Code Copied');
              }}
            >
              Axios
            </Button>
            <Button
              onClick={async () => {
                navigator.clipboard.writeText(`
const logMap = {
  projectUsername: "${project?.username}",
  type: "", // valid types: [success, error, warning, info]
  function: "dsadasdsa",
  notes: ""
};

const response = await fetch("https://lobaadmin-zohofunctionstogit.vercel.app/api/logs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(logMap),
});
`);

                toast.success('Fetch Code Copied');
              }}
            >
              Fetch
            </Button>
            <ButtonLoading
              variant="destructive"
              loading={mutationDeleteLogs.isPending}
              onClick={mutationDeleteLogs.mutate}
            >
              Clear Logs
            </ButtonLoading>
          </div>
        </div>
        {/* table */}
        <div className="">
          <div className="flex items-center gap-2 py-4">
            <Input
              className="max-w-sm"
              placeholder="Filter by function name..."
              value={
                (table
                  .getColumn('function')
                  ?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table
                  .getColumn('function')
                  ?.setFilterValue(event.target.value)
              }
            />

            <DataTableFacetedFilter
              key="type"
              title="Types"
              column={table.getColumn('type')}
              options={LOGS_TYPES.map((type) => ({
                label: type,
                value: type,
              }))}
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
          <div className="rounded-md border">
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
                    <TableRow
                      key={row.id}
                      className={cn(
                        'transition-all duration-200',
                        // recentItemIds.includes(row.original.id) &&
                        //   'bg-black/10 dark:bg-white/20',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className="py-2 text-xs"
                          key={cell.id}
                        >
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
      </div>
    </>
  );
}
