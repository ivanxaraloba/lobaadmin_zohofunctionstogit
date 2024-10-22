'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { JsonViewer } from '@textea/json-viewer';
import { format } from 'date-fns';
import { Eye, Logs } from 'lucide-react';
import Link from 'next/link';

import LoadingScreen from '@/components/shared/loading-screen';
import { TypographyH1 } from '@/components/typography/typography-h1';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjectStore } from '@/stores/project';
import { time } from '@/utils/generic';

const STATUS_COLORS = {
  success: 'bg-green-400',
  error: 'bg-red-400',
  warning: 'bg-yellow-400',
  info: 'bg-gray-400',
};

const isJson = (notes: string) => {
  try {
    JSON.parse(notes);
    return true;
  } catch {
    return false;
  }
};

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <div
        //@ts-ignore
        className={`size-2 rounded-full ${STATUS_COLORS[row.original.type || 'info']}`}
      />
    ),
  },
  {
    accessorKey: 'function',
    header: 'Function',
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => (
      <div className="max-h-14 overflow-hidden text-wrap">{row.original.notes}</div>
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (!project?.id) return;

    const fetchData = async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('projectId', project.id)
        .order('created_at', { ascending: false });
      setData(data || []);
    };

    fetchData();

    const changes = supabase
      .channel('table-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `projectId=eq.${project.id}`,
        },
        (payload) => setData((prevData) => [payload.new, ...prevData]),
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
logMap = map();
logMap.put("projectId", null);
logMap.put("status", "");
logMap.put("type", "");
logMap.put("function", "");
logMap.put("notes", "");
`);
              }}
            >
              Click
            </Button>
          </div>
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
    </>
  );
}
