import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHomeButton?: boolean;
    className?: string;
}

export function ErrorState({
    title = 'Something Went Wrong',
    message = "We couldn't load this page. Please try again.",
    onRetry,
    showHomeButton = true,
    className = '',
}: ErrorStateProps) {
    const navigate = useNavigate();

    return (
        <div className={`flex flex-col items-center justify-center h-[50vh] text-center ${className}`}>
            <Card className="max-w-md w-full">
                <CardContent className="pt-8 pb-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">
                            {title}
                        </h2>
                        <p className="text-muted-foreground">
                            {message}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {onRetry && (
                            <Button onClick={onRetry} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                        )}
                        {showHomeButton && (
                            <Button
                                variant="outline"
                                onClick={() => navigate('/early-years/today')}
                                className="gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
