import { createFileRoute } from '@tanstack/react-router';
import { LobbyPage } from '@/features/lobby/lobby-page';

export const Route = createFileRoute('/lobby')({
  component: LobbyPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      meetingId: (search.meetingId as string) || null,
    };
  },
});
