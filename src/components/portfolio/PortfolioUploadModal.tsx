import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadSimple, Camera, X, Image as ImageIcon, FileAudio, FileText, SpinnerGap } from '@phosphor-icons/react';
import { portfolio } from '@/lib/api';
import { PortfolioItemType } from '@/types';

interface PortfolioUploadModalProps {
    studentId: string;
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
    relatedActivityId?: string;
    preselectedDomain?: string;
}

export function PortfolioUploadModal({
    studentId,
    isOpen,
    onClose,
    onUploadComplete,
    relatedActivityId,
    preselectedDomain
}: PortfolioUploadModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [domain, setDomain] = useState<string>(preselectedDomain || 'wisdom');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Fix memory leak with object URLs
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Cleanup
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const getItemType = (file: File): PortfolioItemType => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type === 'application/pdf') return 'document';
        return 'document';
    };

    const handleUpload = async () => {
        if (!file || !title) return;

        setIsUploading(true);
        try {
            // 1. Get upload URL
            const { uploadUrl, key, publicUrl } = await portfolio.getUploadUrl(file.name, file.type);

            // 2. Upload file
            // Note: In MVP we are uploading to a proxy endpoint, but the flow is same
            const xhr = new XMLHttpRequest();

            await new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress(Math.round((event.loaded / event.total) * 100));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
                    else reject(new Error('Upload failed'));
                });

                xhr.addEventListener('error', () => reject(new Error('Upload failed')));

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

            // 3. Create record
            await portfolio.createItem({
                studentId,
                title,
                description,
                itemType: getItemType(file),
                r2Key: key, // We stored it with 'portfolio/' prefix in the handler if using proxy
                domain,
                relatedActivityId
            });

            toast({
                title: 'Success',
                description: 'Added to portfolio!',
            });

            onUploadComplete();
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setUploadProgress(0);

        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to upload item',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to Portfolio</DialogTitle>
                    <DialogDescription>
                        Save a photo, drawing, or recording of your child's work.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* File Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                {file.type.startsWith('image/') && previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-32 object-contain rounded-md"
                                    />
                                ) : (
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                        {file.type.startsWith('audio/') ? <FileAudio className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                                    </div>
                                )}
                                <div className="text-sm font-medium">{file.name}</div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-destructive hover:text-destructive">
                                    <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-2">
                                    <UploadSimple className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="text-sm font-medium">Click to upload or drag & drop</div>
                                <div className="text-xs text-muted-foreground">Images, Audio, or PDF</div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,audio/*,application/pdf"
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Nature Drawing"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Select value={domain} onValueChange={setDomain}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wisdom">Wisdom (Cognitive)</SelectItem>
                                <SelectItem value="stature">Stature (Physical)</SelectItem>
                                <SelectItem value="favor_with_god">Favor with God (Spiritual)</SelectItem>
                                <SelectItem value="favor_with_man">Favor with Man (Social)</SelectItem>
                                <SelectItem value="foundations">Foundations</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Notes (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What did they say about their work?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || !title || isUploading}>
                        {isUploading ? (
                            <>
                                <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                                {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Uploading...'}
                            </>
                        ) : (
                            'Save Item'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
