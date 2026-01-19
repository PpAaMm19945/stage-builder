import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface IndependenceSettingsData {
    canMarkComplete?: boolean;
    canAskAi?: boolean;
    canViewPortfolio?: boolean;
}

interface IndependenceSettingsProps {
    settings: IndependenceSettingsData;
    onUpdate: (key: keyof IndependenceSettingsData, value: boolean) => void;
    disabled?: boolean;
}

export function IndependenceSettings({ settings, onUpdate, disabled }: IndependenceSettingsProps) {
    return (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm text-foreground">Independence Permissions</h3>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Control what this child can do in their portal.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="can-mark-complete" className="flex flex-col space-y-1">
                        <span>Mark Activities Complete</span>
                        <span className="font-normal text-xs text-muted-foreground">Allow child to check off their own work</span>
                    </Label>
                    <Switch
                        id="can-mark-complete"
                        checked={settings.canMarkComplete ?? false}
                        onCheckedChange={(checked: boolean) => onUpdate('canMarkComplete', checked)}
                        disabled={disabled}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="can-ask-ai" className="flex flex-col space-y-1">
                        <span>Ask AI Teacher</span>
                        <span className="font-normal text-xs text-muted-foreground">Enable chat with the AI guide</span>
                    </Label>
                    <Switch
                        id="can-ask-ai"
                        checked={settings.canAskAi ?? false}
                        onCheckedChange={(checked: boolean) => onUpdate('canAskAi', checked)}
                        disabled={disabled}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="can-view-portfolio" className="flex flex-col space-y-1">
                        <span>View Portfolio</span>
                        <span className="font-normal text-xs text-muted-foreground">Access to see their past work history</span>
                    </Label>
                    <Switch
                        id="can-view-portfolio"
                        checked={settings.canViewPortfolio ?? false}
                        onCheckedChange={(checked: boolean) => onUpdate('canViewPortfolio', checked)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}
