import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type DataLifecycleCardProps = {
  onExport: () => void;
  onReset: () => void;
  onDelete: () => void;
};

export function DataLifecycleCard({
  onExport,
  onReset,
  onDelete,
}: DataLifecycleCardProps) {
  return (
    <Card className="border border-red-900/40 bg-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-red-100">
          <Trash2 className="h-4 w-4" />
          Data lifecycle
        </CardTitle>
        <CardDescription className="text-red-200/80">
          Delete sessions, request exports, or reset your AI memory.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-red-100">
        <Button
          variant="outline"
          className="border-red-800/60 text-red-100 hover:bg-red-900/30"
          onClick={onExport}
        >
          Export all transcripts
        </Button>
        <Button
          variant="outline"
          className="border-red-800/60 text-red-100 hover:bg-red-900/30"
          onClick={onReset}
        >
          Reset AI memory
        </Button>
        <Button
          variant="ghost"
          className="text-red-200 hover:bg-red-900/30"
          onClick={onDelete}
        >
          Delete workspace
        </Button>
      </CardContent>
    </Card>
  );
}
