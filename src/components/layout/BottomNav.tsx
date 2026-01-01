import { useLocation, useNavigate } from 'react-router-dom';
import { House, Books, TrendUp, Heart } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: House, label: 'Today', path: '/' },
    { icon: Books, label: 'Library', path: '/early-years/activities' },
    { icon: TrendUp, label: 'Progress', path: '/early-years/progress' },
    { icon: Heart, label: 'Support', path: '/settings#support' },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path.split('#')[0]));

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-6 w-6" weight={isActive ? "fill" : "duotone"} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
