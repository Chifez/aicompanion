import { Badge } from '@/components/ui/badge';

export function LobbyHeader() {
  return (
    <div className="flex flex-col gap-2 text-center">
      <Badge className="mx-auto bg-slate-200 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
        Session lobby
      </Badge>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
        Check your setup before joining
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Allow microphone and camera so your AI companion can mirror your
        presence in real time.
      </p>
    </div>
  );
}
