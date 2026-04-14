import { useLocation, Link } from 'react-router-dom';
import { House, Books, SlidersHorizontal, PlayCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { icon: House, label: 'Today', path: '/today' },
    { icon: PlayCircle, label: 'Session', path: '/session' },
    { icon: Books, label: 'Library', path: '/library' },
    { icon: SlidersHorizontal, label: 'Settings', path: '/settings' },
];

const guestItems = [
    { icon: House, label: 'Home', path: '/' },
    { icon: Books, label: 'Library', path: '/library' },
];

export function BottomNav() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const items = isAuthenticated ? navItems : guestItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {items.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && item.path !== '/today' && location.pathname.startsWith(item.path.split('#')[0]));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-6 w-6" weight={isActive ? "fill" : "duotone"} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
