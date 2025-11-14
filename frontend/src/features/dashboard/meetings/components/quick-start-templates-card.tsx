import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type QuickStartTemplate = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

type QuickStartTemplatesCardProps = {
  templates: QuickStartTemplate[];
  onLaunch: (template: QuickStartTemplate) => void;
};

export function QuickStartTemplatesCard({
  templates,
  onLaunch,
}: QuickStartTemplatesCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base text-slate-900 dark:text-slate-100">
            Quick start templates
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Shortcut into a tailored meeting format.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-slate-200/70 bg-slate-100 p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-200/70 dark:border-slate-900/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-900/60"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {template.title}
              </p>
              <Badge
                variant="outline"
                className="border-slate-300 text-[10px] text-slate-600 dark:border-slate-800/60 dark:text-slate-300"
              >
                {template.badge}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              {template.description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              onClick={() => onLaunch(template)}
            >
              Launch
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
