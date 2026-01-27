
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PuzzlePiece, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SearchResult {
    id: string;
    title: string;
    description: string;
    type: 'book' | 'activity';
    metadata?: any;
}

interface ActionCardProps {
    type: string;
    data: {
        query: string;
        results: SearchResult[];
    };
    onSelect?: (id: string, type: string) => void;
}

export function ActionCard({ type, data }: ActionCardProps) {
    if (type === 'SEARCH_BOOKS' || type === 'SEARCH_ACTIVITIES') {
        const icon = type === 'SEARCH_BOOKS' ? <BookOpen className="w-5 h-5" /> : <PuzzlePiece className="w-5 h-5" />;
        const colorClass = type === 'SEARCH_BOOKS' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';

        return (
            <div className="w-full max-w-[85%] space-y-2 my-2">
                <div className={`text-xs font-medium uppercase tracking-wider flex items-center gap-2 ${colorClass} px-3 py-1 rounded-full w-fit`}>
                    {icon}
                    Found {data.results.length} Matches
                </div>

                <div className="grid gap-2">
                    {data.results.map((item) => (
                        <Card key={item.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-3 flex items-start gap-3">
                                <div className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${colorClass}`}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
