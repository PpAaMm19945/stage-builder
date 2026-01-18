import { CircleNotch } from '@phosphor-icons/react';

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <CircleNotch className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
