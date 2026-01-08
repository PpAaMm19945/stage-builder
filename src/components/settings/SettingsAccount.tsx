import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
    User,
    ShieldCheck,
    SignOut,
    SunDim,
    Heart
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function SettingsAccount() {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {user ? getInitials(user.name) : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-foreground">{user?.name}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <Separator />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            toast.info('Your profile is synced from your Google account');
                        }}
                    >
                        Edit Profile
                    </Button>
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <SunDim className="h-5 w-5" weight="duotone" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize how SchoolOS looks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground">
                                Choose light, dark, or match your device
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

            {/* Support SchoolOS */}
            <Card id="support" className="border-green-200 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/10 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
                        <Heart className="h-5 w-5" weight="fill" />
                        Support SchoolOS
                    </CardTitle>
                    <CardDescription>
                        Help keep learning free for African families
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Monthly Goal</span>
                            <span className="font-medium">$412 / $500</span>
                        </div>
                        <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[82%] rounded-full" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            $500/month covers storage for 10,000 families and 1,000+ books
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" className="border-green-300 dark:border-green-700">$1</Button>
                        <Button variant="outline" className="border-green-300 dark:border-green-700">$5</Button>
                        <Button variant="outline" className="border-green-300 dark:border-green-700">$10</Button>
                        <Button variant="outline" className="border-green-300 dark:border-green-700">Other</Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Contributions are not tax-deductible. Payment processed securely.
                    </p>
                </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheck className="h-5 w-5" />
                        Privacy & Security
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Button variant="link" className="px-0 h-auto" onClick={() => window.location.href = '/privacy'}>
                            Privacy Policy
                        </Button>
                        <br />
                        <Button variant="link" className="px-0 h-auto" onClick={() => window.location.href = '/terms'}>
                            Terms of Service
                        </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Request deletion of your account and all associated data.
                        </p>
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            onClick={() => {
                                window.open('mailto:antmwes104.1@gmail.com?subject=SchoolOS%20Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.', '_blank');
                                toast.info('Account deletion request', {
                                    description: 'Your email client should open. Send the email to complete your request.'
                                });
                            }}
                        >
                            Request Account Deletion
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sign Out */}
            <Card className="border-destructive/20">
                <CardContent className="pt-6">
                    <Button variant="destructive" onClick={logout} className="gap-2">
                        <SignOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
