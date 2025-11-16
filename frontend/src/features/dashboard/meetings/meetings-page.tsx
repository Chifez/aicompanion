import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Waves } from 'lucide-react';
import { ScheduledMeetingsCard } from './components/scheduled-meetings-card';
import { SessionHealthCard } from './components/session-health-card';
import { QuickStartTemplatesCard } from './components/quick-start-templates-card';
import { MeetingEditorDialog } from './components/meeting-editor-dialog';
import { TemplateLaunchDialog } from './components/template-launch-dialog';
import { MeetingsSkeleton } from './components/meetings-skeleton';
import { useMeetings } from './hooks/use-meetings';
import { useMeetingMutations } from './hooks/use-meeting-mutations';
import {
  toScheduledMeeting,
  toMeetingDraft,
  type ScheduledMeeting,
  type MeetingFormState,
} from './utils/transform';
import type { MeetingsResponse } from '@/types/api';

export function MeetingsPage() {
  const navigate = useNavigate();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [selectedMeeting, setSelectedMeeting] =
    React.useState<ScheduledMeeting | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    MeetingsResponse['quickStartTemplates'][number] | null
  >(null);

  const meetingsQuery = useMeetings();
  const { createMeeting, updateMeeting, deleteMeeting } = useMeetingMutations();

  const meetings = meetingsQuery.data?.scheduled.map(toScheduledMeeting) ?? [];
  const templates = meetingsQuery.data?.quickStartTemplates ?? [];
  const healthItems = meetingsQuery.data
    ? [
        {
          label: 'Conversation balance',
          status: meetingsQuery.data.sessionHealth.conversationBalance,
          icon: <Waves className="h-4 w-4 text-sky-400" />,
        },
        {
          label: 'Average latency',
          status: `${meetingsQuery.data.sessionHealth.averageLatencyMs} ms`,
          icon: <Waves className="h-4 w-4 text-emerald-400" />,
        },
        {
          label: 'Feedback score',
          status: `${meetingsQuery.data.sessionHealth.feedbackScore} · ${meetingsQuery.data.sessionHealth.trend}`,
          icon: <MessageCircle className="h-4 w-4 text-indigo-400" />,
        },
      ]
    : [];

  const handleSubmitDraft = (draft: MeetingFormState) => {
    if (selectedMeeting) {
      // Updating existing meeting - just save, no redirect
      updateMeeting.mutate(
        { id: selectedMeeting.id, draft },
        {
          onSuccess: () => {
            setEditorOpen(false);
            setSelectedMeeting(null);
          },
        }
      );
    } else {
      // Creating new scheduled meeting - just save, no redirect
      // User will need to click "Start meeting" button on the card to go to lobby
      createMeeting.mutate(draft, {
        onSuccess: () => {
          // Just close the dialog, meeting will appear in the list
          setEditorOpen(false);
        },
      });
    }
  };

  const handleDeleteMeeting = () => {
    if (!selectedMeeting) return;
    deleteMeeting.mutate(selectedMeeting.id);
    setSelectedMeeting(null);
    setEditorOpen(false);
  };

  const handleLaunchTemplate = () => {
    if (!selectedTemplate) return;
    const draft: MeetingFormState = {
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      startTime: new Date().toISOString(),
      durationMinutes: 30,
      voiceProfile: 'Aurora · Creative Lead',
    };
    // Templates create scheduled meetings - no redirect, user clicks "Start meeting" to go to lobby
    createMeeting.mutate(draft, {
      onSuccess: () => {
        // Just close the dialog, meeting will appear in the list
        setTemplateDialogOpen(false);
      },
    });
  };

  const handleStartMeeting = (meeting: ScheduledMeeting) => {
    navigate({
      to: '/lobby',
      search: { meetingId: meeting.id },
    });
  };

  if (meetingsQuery.isLoading) {
    return <MeetingsSkeleton />;
  }

  if (meetingsQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-24 text-center text-slate-300">
        <p className="text-lg font-semibold">Unable to load meetings.</p>
        <p className="text-sm text-slate-400">
          {(meetingsQuery.error as Error)?.message ??
            'Please refresh the page or try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-slate-900 dark:text-slate-100">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Meetings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Schedule or jump into a realtime session with your AI co-host. Use
          templates to set the tone and objective.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ScheduledMeetingsCard
          meetings={meetings}
          onCreate={() => {
            setSelectedMeeting(null);
            setEditorOpen(true);
          }}
          onAdjust={(meeting) => {
            setSelectedMeeting(meeting);
            setEditorOpen(true);
          }}
          onStart={handleStartMeeting}
        />

        <SessionHealthCard healthItems={healthItems} />
      </section>

      <section>
        <QuickStartTemplatesCard
          templates={templates}
          onLaunch={(template) => {
            setSelectedTemplate(template);
            setTemplateDialogOpen(true);
          }}
        />
      </section>

      <MeetingEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialMeeting={
          selectedMeeting ? toMeetingDraft(selectedMeeting) : undefined
        }
        onSubmit={handleSubmitDraft}
        onDelete={selectedMeeting ? handleDeleteMeeting : undefined}
      />

      <TemplateLaunchDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={selectedTemplate}
        onLaunch={handleLaunchTemplate}
      />
    </div>
  );
}
