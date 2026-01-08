import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FamilyPositionBarProps {
  childrenData: ReturnType<typeof useAuth>['children'];
}

export function FamilyPositionBar({ childrenData }: FamilyPositionBarProps) {
  if (!childrenData || childrenData.length === 0) return null;

  const totalMonths = 72; // 0-6 years

  // Helper to position dots (0-100%)
  const getPosition = (ageMonths: number) => {
    const pos = (ageMonths / totalMonths) * 100;
    return Math.min(Math.max(pos, 0), 100); // Clamp between 0-100
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-end">
        <div>
           <h3 className="font-semibold text-lg">Your Family's Journey</h3>
           <p className="text-sm text-muted-foreground">Where your children are in The Garden</p>
        </div>
      </div>

      <div className="relative h-12 mt-6 mb-2 mx-4">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />

        {/* Tick Marks for Years */}
        {[0, 1, 2, 3, 4, 5, 6].map((year) => (
          <div
            key={year}
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            style={{ left: `${(year * 12 / totalMonths) * 100}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-background border-2 border-muted" />
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap pt-2">
              {year}yr
            </span>
          </div>
        ))}

        {/* Child Markers */}
        {childrenData.map((child) => (
          <div
            key={child.id}
            className="absolute top-1/2 -translate-y-1/2 z-10 -ml-4 transition-all duration-500"
            style={{ left: `${getPosition(child.ageInMonths)}%` }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-md flex items-center justify-center font-bold text-xs ring-2 ring-primary/20 group-hover:scale-110 transition-transform">
                      {getInitials(child.name)}
                    </div>
                    <div className="absolute top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none">
                      {child.name}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-medium">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.ageInMonths} months</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  );
}
