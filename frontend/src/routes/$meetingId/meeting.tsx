import { createFileRoute } from '@tanstack/react-router';
import { MeetingRoomPage } from '@/features/meeting/meeting-room-page';

export const Route = createFileRoute('/$meetingId/meeting')({
  component: MeetingRoom,
});

function MeetingRoom() {
  const { meetingId } = Route.useParams();
  return <MeetingRoomPage meetingId={meetingId} />;
}
