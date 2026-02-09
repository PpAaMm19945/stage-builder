import { Path } from '@phosphor-icons/react';

/**
 * Branded content-area loader for FamilyPath.
 * Used inside layouts so the sidebar/nav stays visible during page transitions.
 */
export function ContentLoader() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/10" />
        {/* Breathing icon */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary animate-pulse">
          <Path className="h-7 w-7 text-primary-foreground" weight="duotone" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        Preparing your experience…
      </p>
    </div>
  );
}
