import { useState } from 'react';
import { Student } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users, User, CircleNotch } from '@phosphor-icons/react';

interface ChildSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: Student[];
    onConfirm: (selectedChildIds: string[]) => void;
    isPending?: boolean;
}

export function ChildSelectionModal({
    open,
    onOpenChange,
    children,
    onConfirm,
    isPending = false
}: ChildSelectionModalProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(children.map(c => c.id)) // Default: all children selected
    );

    const handleToggleChild = (childId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(childId)) {
                next.delete(childId);
            } else {
                next.add(childId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        setSelectedIds(new Set(children.map(c => c.id)));
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedIds));
    };

    const allSelected = selectedIds.size === children.length;
    const noneSelected = selectedIds.size === 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" weight="duotone" />
                        Who did you read with?
                    </DialogTitle>
                    <DialogDescription>
                        Select which children were present for this reading session.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {children.length > 1 && (
                        <div className="flex items-center justify-between pb-2 border-b">
                            <Label className="text-sm text-muted-foreground">
                                {allSelected ? 'All children selected' : `${selectedIds.size} of ${children.length} selected`}
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={allSelected}
                            >
                                Select All
                            </Button>
                        </div>
                    )}

                    {children.map(child => (
                        <div
                            key={child.id}
                            className="relative flex items-center space-x-3 p-3 rounded-lg hover:bg-accent"
                        >
                            <Checkbox
                                id={child.id}
                                checked={selectedIds.has(child.id)}
                                onCheckedChange={() => handleToggleChild(child.id)}
                            />
                            <div className="flex items-center gap-2 flex-1">
                                {child.avatarUrl ? (
                                    <img
                                        src={child.avatarUrl}
                                        alt={child.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" weight="duotone" />
                                    </div>
                                )}
                                <Label
                                    htmlFor={child.id}
                                    className="cursor-pointer font-medium"
                                >
                                    {child.name}
                                </Label>
                            </div>
                            <label
                                htmlFor={child.id}
                                className="absolute inset-0 cursor-pointer"
                                aria-hidden="true"
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={noneSelected || isPending}
                    >
                        {isPending ? (
                            <>
                                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Log Reading Session'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
