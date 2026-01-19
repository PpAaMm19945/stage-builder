import { CircleNotch } from '@phosphor-icons/react';

export function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <CircleNotch className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
