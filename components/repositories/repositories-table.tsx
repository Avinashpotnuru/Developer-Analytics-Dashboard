"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  FolderGit2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { LanguageBadge } from "@/components/shared/language-badge";
import { VisibilityBadge } from "@/components/shared/visibility-badge";
import { formatNumber, formatRelativeDate } from "@/lib/format";
import type { Repository } from "@/lib/types";

const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  language: "Language",
  stars: "Stars",
  forks: "Forks",
  openIssues: "Open Issues",
  visibility: "Visibility",
  updatedAt: "Updated",
};

function SortableHeader({
  column,
  label,
}: {
  column: Column<Repository, unknown>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5 h-7 px-2 hover:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ChevronsUpDown className="size-3.5 opacity-60" />
    </Button>
  );
}

const columns: ColumnDef<Repository>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {row.original.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.fullName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-xs truncate text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <SortableHeader column={column} label="Language" />
    ),
    cell: ({ row }) => <LanguageBadge language={row.original.language} />,
  },
  {
    accessorKey: "stars",
    header: ({ column }) => <SortableHeader column={column} label="Stars" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNumber(row.original.stars)}</span>
    ),
  },
  {
    accessorKey: "forks",
    header: ({ column }) => <SortableHeader column={column} label="Forks" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNumber(row.original.forks)}</span>
    ),
  },
  {
    accessorKey: "openIssues",
    header: ({ column }) => (
      <SortableHeader column={column} label="Open Issues" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatNumber(row.original.openIssues)}
      </span>
    ),
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => (
      <SortableHeader column={column} label="Visibility" />
    ),
    cell: ({ row }) => <VisibilityBadge visibility={row.original.visibility} />,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableHeader column={column} label="Updated" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatRelativeDate(row.original.updatedAt)}
      </span>
    ),
  },
];

interface RepositoriesTableProps {
  repositories: Repository[];
  compact?: boolean;
}

export function RepositoriesTable({
  repositories,
  compact = false,
}: RepositoriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ openIssues: compact });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data: repositories,
    columns,
    globalFilterFn: "includesString",
    state: { sorting, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: compact ? undefined : getPaginationRowModel(),
    initialState: { pagination: { pageSize: compact ? 6 : 8 } },
  });

  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="space-y-4">
      {!compact ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8"
              aria-label="Search repositories"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3 className="size-4" />
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                    className="capitalize"
                  >
                    {COLUMN_LABELS[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                  <TableCell colSpan={visibleColumnCount}>
                    <EmptyState
                      icon={FolderGit2}
                      title="No repositories found"
                      description="Try adjusting your search or filters."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!compact ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} repositories
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
