'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { MitigationCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MitigationSelectionDialogProps {
  biasCardId: string;
  biasCardName: string;
  mitigationCards: MitigationCard[];
  selectedMitigations: string[];
  onSelectMitigations: (mitigationIds: string[]) => void;
  trigger?: React.ReactNode;
}

export function MitigationSelectionDialog({
  biasCardId: _biasCardId,
  biasCardName,
  mitigationCards,
  selectedMitigations,
  onSelectMitigations,
  trigger,
}: MitigationSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tempSelectedIds, setTempSelectedIds] =
    useState<string[]>(selectedMitigations);

  const handleSelect = (mitigationId: string) => {
    setTempSelectedIds((prev) => {
      if (prev.includes(mitigationId)) {
        return prev.filter((id) => id !== mitigationId);
      }
      return [...prev, mitigationId];
    });
  };

  const handleConfirm = () => {
    onSelectMitigations(tempSelectedIds);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setTempSelectedIds(selectedMitigations);
      setSearchValue('');
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full" size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Mitigation Strategies ({selectedMitigations.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Select Mitigation Strategies</DialogTitle>
          <DialogDescription>
            Choose mitigation strategies for "{biasCardName}". You can select
            multiple strategies.
          </DialogDescription>
        </DialogHeader>

        <Command className="flex-1 overflow-hidden">
          <CommandInput
            onValueChange={setSearchValue}
            placeholder="Search mitigation strategies..."
            value={searchValue}
          />
          <CommandList className="h-full max-h-none">
            <CommandEmpty>No mitigation strategies found.</CommandEmpty>
            <CommandGroup className="p-2">
              {mitigationCards.map((mitigation) => (
                <CommandItem
                  className="mb-2 cursor-pointer p-4 data-[selected=true]:bg-accent/50"
                  key={mitigation.id}
                  onSelect={() => handleSelect(mitigation.id)}
                  value={mitigation.name}
                >
                  <div className="flex w-full items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
                        tempSelectedIds.includes(mitigation.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )}
                    >
                      {tempSelectedIds.includes(mitigation.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{mitigation.name}</div>
                      <div className="line-clamp-2 text-muted-foreground text-sm">
                        {mitigation.description}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {tempSelectedIds.length} selected
            </span>
            <div className="flex gap-2">
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Apply Selection</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
