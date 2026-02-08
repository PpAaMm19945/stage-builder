import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
    User,
    ShieldCheck,
    SignOut,
    SunDim
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FundingWidget } from '@/components/funding/FundingWidget';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                        Customize how FamilyPath looks
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

            {/* Support FamilyPath */}
            <FundingWidget
                id="support"
                variant="full"
                raised={412}
                goal={500}
            />

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
                        <Button asChild variant="link" className="px-0 h-auto font-semibold text-primary">
                            <Link to="/trust">The Trust Covenant</Link>
                        </Button>
                        <br />
                        <Button asChild variant="link" className="px-0 h-auto">
                            <Link to="/privacy">Privacy Policy</Link>
                        </Button>
                        <br />
                        <Button asChild variant="link" className="px-0 h-auto">
                            <Link to="/terms">Terms of Service</Link>
                        </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Request deletion of your account and all associated data.
                        </p>
                        <Button
                            variant="outline"
                            asChild
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        >
                            <a
                                href="mailto:antmwes104.1@gmail.com?subject=FamilyPath%20Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data."
                                onClick={() => {
                                    toast.info('Account deletion request', {
                                        description: 'Your email client should open. Send the email to complete your request.'
                                    });
                                }}
                            >
                                Request Account Deletion
                                <ExternalLink className="h-3 w-3 opacity-50 ml-1" />
                                <span className="sr-only">(opens email client)</span>
                            </a>
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
