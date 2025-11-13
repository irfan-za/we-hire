import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting?: boolean;
}

export function BulkActions({
  selectedCount,
  onDelete,
  onClear,
  isDeleting,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete ({selectedCount}) candidate{selectedCount > 1 ? "s" : ""}
      </Button>
      <Button variant="outline" onClick={onClear} disabled={isDeleting}>
        Clear Selection
      </Button>
    </div>
  );
}
