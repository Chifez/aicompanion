import { createFileRoute } from '@tanstack/react-router';
import { MeetingsPage } from '@/features/dashboard/meetings/meetings-page';

export const Route = createFileRoute('/dashboard/meetings')({
  component: MeetingsPage,
});
