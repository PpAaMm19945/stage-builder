import { FormationTimer, useFormationTimer } from './FormationTimer';

// ... (keep existing imports)

interface FormationCardProps {
    formation: Formation;
    onComplete?: (id: string, isCompleted: boolean, durationMinutes?: number) => void;
    isCompleted?: boolean;
    variant?: 'full' | 'compact';
    className?: string;

    // Phase 3: Independence & Feedback
    studentPermissions?: {
        canMarkComplete: boolean;
        canAskAi: boolean;
        canViewPortfolio: boolean;
    };
    onLove?: (id: string, loved: boolean) => void;
    isLoved?: boolean;
}

// ... (keep existing constants)

export function FormationCard({
    formation,
    onComplete,
    isCompleted = false,
    variant = 'full',
    className,
    studentPermissions,
    onLove,
    isLoved = false
}: FormationCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Timer Logic
    const {
        isRunning,
        start,
        stop,
        getElapsedMinutes,
        elapsedSeconds
    } = useFormationTimer();

    // Auto-start timer when expanded (if not completed)
    useEffect(() => {
        if (isOpen && !isCompleted && !isRunning && elapsedSeconds === 0) {
            start();
        } else if (!isOpen && isRunning) {
            // Optional: Pause when collapsed? Or keep running? 
            // Let's keep it running but maybe show a mini indicator if we were doing complex state.
            // for now, let's pause to be safe/conservative about "active" time.
            stop();
        }
    }, [isOpen]);

    // Cast type to include reading
    const type = formation.formation_type as ExtendedFormationType;
    const Icon = TYPE_ICONS[type] || Lightning;
    const iconColor = TYPE_COLORS[type] || 'text-slate-600';
    const borderColor = CARD_BORDERS[type] || 'border-slate-200';

    const handleToggle = (checked: boolean) => {
        if (!onComplete) return;

        // Optimistic confetti if checking
        if (checked) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981'] // Amber & Emerald
            });
            stop(); // Stop timer
        }

        const duration = checked ? getElapsedMinutes() : undefined;
        onComplete(formation.id, checked, duration);
    };

    const handleLoveToggle = () => {
        if (onLove) {
            onLove(formation.id, !isLoved);
        }
    };

    const handleManualTimerToggle = () => {
        if (isRunning) stop();
        else start();
    };

    // Determine completion capability
    const canComplete = studentPermissions ? studentPermissions.canMarkComplete : true; // Default to true if no perms passed (legacy/parent view)

    return (
        <Card
            className={cn(
                "transition-all duration-200",
                borderColor,
                isCompleted ? "opacity-90 bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-950",
                className
            )}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    {/* Main Visual & Title */}
                    <div className="flex items-start gap-3 flex-1">
                        <div className={cn("p-2 rounded-lg bg-opacity-10 shrink-0 mt-0.5", iconColor.replace('text-', 'bg-'))}>
                            <Icon weight="duotone" className={cn("w-5 h-5", iconColor)} />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className={cn(
                                    "font-medium leading-tight",
                                    isCompleted && "line-through text-muted-foreground"
                                )}>
                                    {formation.title}
                                </h3>
                                {type === 'skill' && formation.duration_minutes && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1 font-normal text-muted-foreground">
                                        <Clock size={12} />
                                        {formation.duration_minutes}m
                                    </Badge>
                                )}

                                {/* Timer Indicator (Visible always if running or has time) */}
                                {(isRunning || elapsedSeconds > 0) && !isCompleted && (
                                    <FormationTimer
                                        isRunning={isRunning}
                                        onToggle={handleManualTimerToggle}
                                        showControls
                                        className="ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs"
                                    />
                                )}
                            </div>

                            {/* Context Anchor / Tagline */}
                            {formation.context_anchor && (
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    {formation.context_anchor.replace(/_/g, ' ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Passion Signal (Heart) - Always visible if handler provided, highlighted if active */}
                        {onLove && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleLoveToggle(); }}
                                className={cn(
                                    "h-8 w-8 hover:bg-rose-50 hover:text-rose-600 transition-colors",
                                    isLoved ? "text-rose-500" : "text-muted-foreground/50"
                                )}
                            >
                                <Heart weight={isLoved ? "fill" : "regular"} className="w-5 h-5" />
                            </Button>
                        )}

                        {onComplete && (
                            canComplete ? (
                                <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={handleToggle}
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isCompleted ? "data-[state=checked]:bg-green-600 border-green-600" : ""
                                    )}
                                />
                            ) : (
                                // Permission Denied Indicator
                                <div title="Parent check required">
                                    <LockKey weight="duotone" className="w-5 h-5 text-muted-foreground/50" />
                                </div>
                            )
                        )}

                        {variant === 'full' && (
                            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                    {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
                                </Button>
                            </CollapsibleTrigger>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* Expandable Content based on Type */}
            <Collapsible open={isOpen || variant === 'full' && type === 'reading'} onOpenChange={setIsOpen}>
                <CollapsibleContent className="p-4 pt-0 text-sm space-y-4 animate-slide-down">

                    {/* DESCRIPTION */}
                    {formation.description && (
                        <p className="text-muted-foreground pt-2">{formation.description}</p>
                    )}

                    {!canComplete && !isCompleted && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900">
                            <LockKey className="w-3 h-3" />
                            <span>Do this together with a parent to mark complete.</span>
                        </div>
                    )}

                    {/* Timer Control in Expanded View */}
                    {!isCompleted && canComplete && (
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleManualTimerToggle}
                                className={cn(
                                    "h-7 text-xs gap-1.5",
                                    isRunning ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : ""
                                )}
                            >
                                {isRunning ? <Pause weight="fill" /> : <Play weight="fill" />}
                                {isRunning ? "Pause Timer" : (elapsedSeconds > 0 ? "Resume Timer" : "Start Timer")}
                            </Button>
                            {elapsedSeconds > 0 && <span className="text-xs text-muted-foreground">Time tracked: {Math.ceil(elapsedSeconds / 60)}m</span>}
                        </div>
                    )}

                    {/* LITURGY VIEW */}
                    {type === 'liturgy' && formation.liturgical_script && (
                        <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-800 italic text-muted-foreground my-3">
                            "{formation.liturgical_script}"
                        </div>
                    )}

                    {/* SKILL VIEW: STEPS & MATERIALS */}
                    {type === 'skill' && (
                        <div className="space-y-3 pt-2">
                            {formation.materials && formation.materials.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formation.materials.map((mat, i) => (
                                        <Badge key={i} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                                            {mat}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {formation.guide_steps && formation.guide_steps.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Steps</p>
                                    <ul className="space-y-2">
                                        {formation.guide_steps.map((step, idx) => (
                                            <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <span className="font-mono text-xs text-muted-foreground select-none pt-0.5">{idx + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* READING VIEW */}
                    {type === 'reading' && (
                        // @ts-ignore - Assuming formation extendedProps might have reading fields for now, or leveraging description
                        <div className="flex gap-4 pt-2">
                            {/* Fallback Reading Visual or actual cover if mapped */}
                            <div className="w-16 h-24 bg-sky-100 dark:bg-sky-900/30 rounded flex items-center justify-center shrink-0">
                                <BookOpen size={24} className="text-sky-300" weight="duotone" />
                            </div>
                            <div>
                                {/* In a real scenario, we'd map specialized fields here */}
                                <p className="text-sm text-muted-foreground italic">
                                    {formation.description || "Read specifically for this formation."}
                                </p>
                            </div>
                        </div>
                    )}

                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
