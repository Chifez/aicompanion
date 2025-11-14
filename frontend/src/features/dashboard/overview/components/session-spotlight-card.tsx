import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

type SessionSpotlightCardProps = {
  quote: string;
  ctaLabel: string;
  onViewTranscript: () => void;
};

export function SessionSpotlightCard({
  quote,
  ctaLabel,
  onViewTranscript,
}: SessionSpotlightCardProps) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
            Session spotlight
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Your AI co-host distilled actionable takeaways from yesterday's
            conversation.
          </CardDescription>
        </div>
        <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Sparkles className="mr-1 h-3 w-3" />
          Fresh
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>{quote}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
          onClick={onViewTranscript}
        >
          {ctaLabel}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
