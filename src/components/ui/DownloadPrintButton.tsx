import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilePdf, Printer, Spinner } from '@phosphor-icons/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlobProvider } from '@react-pdf/renderer';

interface DownloadPrintButtonProps {
    document: React.ReactElement;
    fileName: string;
    label?: string; // e.g. "Download PDF" or just "PDF"
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'icon';
    className?: string;
}

export function DownloadPrintButton({
    document,
    fileName,
    label = 'Download PDF',
    variant = 'outline',
    size = 'default',
    className
}: DownloadPrintButtonProps) {
    return (
        <BlobProvider document={document}>
            {({ blob, url, loading, error }) => {
                if (loading) {
                    return (
                        <Button variant={variant} size={size} disabled className={className}>
                            <Spinner className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </Button>
                    );
                }

                if (error) {
                    console.error("PDF Generation Error:", error);
                    return (
                        <Button variant="ghost" size={size} disabled className="text-destructive">
                            Error
                        </Button>
                    );
                }

                // Handle Print
                const handlePrint = () => {
                    if (url) {
                        // Open blob in new window for printing
                        const printWindow = window.open(url);
                        if (printWindow) {
                            // Wait for load then print
                            printWindow.onload = () => {
                                printWindow.print();
                            };
                        }
                    }
                };

                const isIconOnly = size === 'icon';

                if (isIconOnly) {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={variant} size="icon" className={className} aria-label={label}>
                                    <FilePdf className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <a href={url || '#'} download={fileName} className="flex items-center cursor-pointer">
                                        <FilePdf className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }

                return (
                    <div className={cn("flex gap-2", className)}>
                        <Button variant={variant} size={size} asChild>
                            <a href={url || '#'} download={fileName}>
                                <FilePdf className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                                <span className="sm:hidden">PDF</span>
                            </a>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={variant} size="icon" className="h-9 w-9" aria-label="More options">
                                    <CaretDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }}
        </BlobProvider>
    );
}

// Helper icon
function CaretDown(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="currentColor"
            viewBox="0 0 256 256"
            {...props}
        >
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
    );
}
