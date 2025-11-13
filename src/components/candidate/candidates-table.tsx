"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCandidates,
  useDeleteCandidate,
  type Candidate,
} from "@/hooks/use-candidates";
import {
  LoaderCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BulkActions } from "./bulk-actions";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnSizingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CandidatesTableProps {
  jobId: string;
  jobTitle: string;
}
type SortOrder = "asc" | "desc";

const STORAGE_KEY = "candidates-table-state";

function DraggableTableHead({ header }: { header: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: "relative" as const,
    width: header.getSize(),
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn("relative group", isDragging && "z-50")}
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        {header.column.getCanResize() && (
          <div
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            className={cn(
              "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
              "hover:bg-blue-500 active:bg-blue-600",
              header.column.getIsResizing() && "bg-blue-600"
            )}
          />
        )}
      </div>
    </TableHead>
  );
}

export default function CandidatesTable({
  jobId,
  jobTitle,
}: CandidatesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { columnOrder } = JSON.parse(saved);
        return columnOrder || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { columnSizing } = JSON.parse(saved);
        return columnSizing || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { columnVisibility } = JSON.parse(saved);
          return columnVisibility || {};
        } catch (e) {
          return {};
        }
      }
      return {};
    }
  );

  useEffect(() => {
    if (columnOrder.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ columnOrder, columnSizing, columnVisibility })
      );
    }
  }, [columnOrder, columnSizing, columnVisibility]);

  const genderParam = searchParams.get("gender") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");
  const limitParam = parseInt(searchParams.get("limit") || "10");
  const sortByParam = searchParams.get("sort_by") || "created_at";
  const sortOrderParam =
    (searchParams.get("sort_order") as SortOrder) || "desc";

  const candidatesQueryParams = {
    gender: genderParam || undefined,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    page: pageParam,
    limit: limitParam,
  };

  const { data, isLoading, error } = useCandidates(
    jobId,
    candidatesQueryParams
  );
  const deleteCandidateMutation = useDeleteCandidate();

  const candidates = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleBulkDelete = async () => {
    if (selectedCandidates.length === 0) return;

    setIsDeletingBulk(true);
    for (const id of Array.from(selectedCandidates)) {
      await deleteCandidateMutation.mutateAsync(id);
    }
    setSelectedCandidates([]);
    setIsDeletingBulk(false);
  };

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if (
        !updates.page &&
        (updates.gender !== undefined || updates.limit !== undefined)
      ) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const handleGenderChange = (value: string) => {
    updateParams({ gender: value === "all" ? null : value, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
    setSelectedCandidates([]);
  };

  const handleLimitChange = (value: string) => {
    updateParams({ limit: value, page: "1" });
    setSelectedCandidates([]);
  };

  const handleToggleSortFullName = useCallback(() => {
    if (sortByParam !== "full_name") {
      updateParams({ sort_by: "full_name", sort_order: "asc", page: "1" });
    } else {
      const next = sortOrderParam === "asc" ? "desc" : "asc";
      updateParams({ sort_by: "full_name", sort_order: next, page: "1" });
    }
  }, [sortByParam, sortOrderParam, updateParams]);

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getRowModel().rows.length > 0 &&
              table.getIsAllRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="ml-7 mr-4 border-2"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        size: 50,
        enableResizing: false,
        enableSorting: false,
      },
      {
        accessorKey: "full_name",
        id: "full_name",
        header: () => (
          <button
            type="button"
            className="flex items-center gap-2"
            onClick={handleToggleSortFullName}
          >
            <span>FULL NAME</span>
            {sortByParam === "full_name" ? (
              sortOrderParam === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-60" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <div className="font-medium">{getValue() as string}</div>
        ),
        size: 200,
      },
      {
        accessorKey: "email",
        id: "email",
        header: "EMAIL ADDRESS",
        cell: ({ getValue }) => <div>{getValue() as string}</div>,
        size: 250,
      },
      {
        accessorKey: "phone",
        id: "phone",
        header: "PHONE NUMBERS",
        cell: ({ getValue }) => <div>{(getValue() as string) ?? "-"}</div>,
        size: 150,
      },
      {
        accessorKey: "date_of_birth",
        id: "date_of_birth",
        header: "DATE OF BIRTH",
        cell: ({ getValue }) => (
          <div>{formatDate(getValue() as string) ?? "-"}</div>
        ),
        size: 150,
      },
      {
        accessorKey: "domicile",
        id: "domicile",
        header: "DOMICILE",
        cell: ({ getValue }) => (
          <div className="truncate max-w-[200px]">
            {(getValue() as string) ?? "-"}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: "gender",
        id: "gender",
        header: "GENDER",
        cell: ({ getValue }) => (
          <div className="capitalize">{(getValue() as string) ?? "-"}</div>
        ),
        size: 120,
      },
      {
        accessorKey: "linkedin_link",
        id: "linkedin_link",
        header: "LINK LINKEDIN",
        cell: ({ getValue }) => {
          const link = getValue() as string | null;
          return link ? (
            <Link
              href={link}
              target="_blank"
              className="text-blue-600 hover:underline truncate block max-w-[200px]"
            >
              {link}
            </Link>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
        size: 250,
      },
    ],
    [sortByParam, sortOrderParam, handleToggleSortFullName]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    data: candidates,
    columns,
    state: {
      columnOrder,
      columnSizing,
      columnVisibility,
      rowSelection: selectedCandidates.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>),
    },
    enableRowSelection: true,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function"
          ? updater(
              selectedCandidates.reduce((acc, id) => {
                acc[id] = true;
                return acc;
              }, {} as Record<string, boolean>)
            )
          : updater;
      setSelectedCandidates(
        Object.keys(newSelection).filter((id) => newSelection[id])
      );
    },
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = table
        .getAllLeafColumns()
        .findIndex((col) => col.id === active.id);
      const newIndex = table
        .getAllLeafColumns()
        .findIndex((col) => col.id === over.id);
      const newColumnOrder = arrayMove(
        table.getAllLeafColumns().map((col) => col.id),
        oldIndex,
        newIndex
      );
      setColumnOrder(newColumnOrder);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoaderCircle className="animate-spin h-12 w-12" />
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">Failed to load candidates</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin" className="hover:text-foreground">
              Job list
            </Link>
            <span>/</span>
            <span className="text-foreground">Manage Candidate</span>
          </div>
          <h1 className="text-2xl font-semibold">{jobTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <BulkActions
            selectedCount={selectedCandidates.length}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedCandidates([])}
            isDeleting={isDeletingBulk || deleteCandidateMutation.isPending}
          />
          <Select value={genderParam} onValueChange={handleGenderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="border rounded-lg overflow-auto">
          <Table style={{ width: table.getTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={headerGroup.headers.map((h) => h.column.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHead key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
                    No candidates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {candidates.length > 0 && (
        <div className="flex flex-col sm:flex-row items-end md:items-center justify-between py-1 md:py-3 border-t gap-4">
          <div className="flex items-center gap-4 min-w-xs">
            <div className="text-xs text-muted-foreground ml-auto md:ml-0">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pagination.limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">per page</span>
            </div>
          </div>
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent className="ml-auto">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.page > 1) {
                        handlePageChange(pagination.page - 1);
                      }
                    }}
                    className={
                      pagination.page <= 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;

                  const showPage =
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.page) <= 1;

                  if (!showPage) {
                    if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={isCurrentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.page < pagination.totalPages) {
                        handlePageChange(pagination.page + 1);
                      }
                    }}
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
