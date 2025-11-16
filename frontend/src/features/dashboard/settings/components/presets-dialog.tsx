import * as React from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { VoicePreset } from '@/types/api';
import { useVoicePresetMutations } from '../hooks/use-voice-preset-mutations';

type PresetsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: VoicePreset[];
};

export function PresetsDialog({
  open,
  onOpenChange,
  presets,
}: PresetsDialogProps) {
  const { updatePreset, deletePreset } = useVoicePresetMutations();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const handleStartRename = (preset: VoicePreset) => {
    setEditingId(preset.id);
    setEditName(preset.name);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveRename = (presetId: string) => {
    if (!editName.trim()) {
      return;
    }
    const trimmedName = editName.trim();
    // Check if name actually changed
    const preset = presets.find((p) => p.id === presetId);
    if (preset && preset.name === trimmedName) {
      // No change, just cancel
      setEditingId(null);
      setEditName('');
      return;
    }
    updatePreset.mutate(
      {
        presetId,
        payload: { name: trimmedName },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
        },
        onError: (error: any) => {
          console.error('Failed to rename preset:', error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to save preset name. Please try again.';
          toast.error(errorMessage);
          // Keep editing mode open on error so user can retry
        },
      }
    );
  };

  const handleDelete = (presetId: string, presetName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${presetName}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    deletePreset.mutate(presetId, {
      onSuccess: () => {
        toast.success(`"${presetName}" deleted successfully`);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to delete preset';
        toast.error(errorMessage);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Manage voice presets
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Rename or remove saved AI personality presets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {presets.length === 0 ? (
            <p className="py-4 text-center text-slate-500">
              No presets available
            </p>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-slate-100 px-3 py-2 dark:border-slate-800/60 dark:bg-slate-900/40"
              >
                {editingId === preset.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename(preset.id);
                        } else if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      className="h-8 flex-1 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveRename(preset.id)}
                      disabled={updatePreset.isPending}
                      className="h-8 px-2"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelRename}
                      className="h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartRename(preset)}
                        className="h-8 px-2 text-slate-500 hover:text-slate-900 dark:text-slate-300"
                        title="Rename preset"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!preset.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(preset.id, preset.name)}
                          disabled={deletePreset.isPending}
                          className="h-8 px-2 text-red-500 hover:text-red-700 dark:text-red-400"
                          title="Delete preset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
