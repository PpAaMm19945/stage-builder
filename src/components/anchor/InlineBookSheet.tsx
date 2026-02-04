import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BookReader } from '@/components/books/BookReader';
import type { Book } from '@/types';

interface InlineBookSheetProps {
    book: Book | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * A bottom sheet wrapper for the BookReader component.
 * Allows reading books inline without leaving the Anchor page.
 */
export function InlineBookSheet({ book, open, onOpenChange }: InlineBookSheetProps) {
    if (!book) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[90vh] p-0 rounded-t-2xl"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{book.title}</SheetTitle>
                </SheetHeader>
                <BookReader
                    book={book}
                    open={open}
                    onOpenChange={onOpenChange}
                />
            </SheetContent>
        </Sheet>
    );
}

export default InlineBookSheet;
