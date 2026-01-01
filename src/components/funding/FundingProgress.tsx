import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FundingProgress({ variant = 'card' }: { variant?: 'card' | 'minimal' }) {
  // Mock data - in real app this would come from an API
  const fundingGoal = 500;
  const currentFunding = 225;
  const percentage = Math.min(100, Math.round((currentFunding / fundingGoal) * 100));

  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'minimal') {
    return (
      <div className="w-full space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500" weight="fill" />
            Community Goal
          </span>
          <span className="text-muted-foreground">{percentage}% funded</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setIsOpen(true)}>
          Help keep SchoolOS online
        </Button>

        <ContributeDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>
    );
  }

  return (
    <>
      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" weight="fill" />
            Community Supported
          </CardTitle>
          <CardDescription>
            SchoolOS is free for everyone, powered by families like yours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Monthly Server Costs</span>
              <span>${currentFunding} / ${fundingGoal}</span>
            </div>
            <Progress value={percentage} className="h-2.5" />
            <p className="text-xs text-muted-foreground text-center pt-1">
              We are <strong>{percentage}%</strong> funded for this month!
            </p>
          </div>

          <Button onClick={() => setIsOpen(true)} className="w-full gap-2 shadow-sm">
            <Sparkle className="w-4 h-4 text-yellow-300" weight="fill" />
            Make a Contribution
          </Button>
        </CardContent>
      </Card>

      <ContributeDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

function ContributeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <Heart className="w-6 h-6 text-red-500" weight="fill" />
             Support SchoolOS
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Your contribution directly pays for the servers, storage, and book licensing that keep this platform running for 10,000+ families.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="flex flex-col h-20 gap-1 hover:bg-primary/5 hover:border-primary/30">
              <span className="text-lg font-bold">$5</span>
              <span className="text-xs text-muted-foreground">High Five</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-1 hover:bg-primary/5 hover:border-primary/30 border-primary/40 bg-primary/5">
              <span className="text-lg font-bold">$10</span>
              <span className="text-xs text-muted-foreground">Book Lover</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 gap-1 hover:bg-primary/5 hover:border-primary/30">
              <span className="text-lg font-bold">$25</span>
              <span className="text-xs text-muted-foreground">Class Hero</span>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
             <p>All contributions go directly to operational costs.</p>
             <p className="mt-1 text-xs opacity-70">Secure payment via Stripe (Mock)</p>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={() => {
            // Mock payment flow
            onOpenChange(false);
        }}>
          Continue to Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
}
