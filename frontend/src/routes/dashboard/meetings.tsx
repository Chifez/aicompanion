import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MessageCircle, Waves } from 'lucide-react';
import {
  QuickStartTemplatesCard,
  ScheduledMeetingsCard,
  SessionHealthCard,
  ScheduledMeeting,
} from '@/components/dashboard/meetings-sections';
import {
  MeetingEditorDialog,
  TemplateLaunchDialog,
} from '@/components/dashboard/meetings-modals';

const scheduledMeetings = [
  {
    id: 'mentor-sync',
    title: 'Morning Momentum',
    description:
      'Kickstart your day with tailored prompts and motivational check-in.',
    start: 'Tomorrow · 8:30 AM',
    duration: '25 mins',
    voice: 'Evelyn · Warm Mentor',
  },
  {
    id: 'focus-support',
    title: 'Deep Work Sprint',
    description:
      'AI companion keeps you accountable with timeboxing and recap cues.',
    start: 'Thu · 3:00 PM',
    duration: '45 mins',
    voice: 'Milo · Calm Strategist',
  },
];

const quickStartTemplates = [
  {
    id: 'creative-storm',
    title: 'Creative Partner',
    description: 'Ideate feature concepts, storyboards, and narrative beats.',
    badge: 'Popular',
  },
  {
    id: 'wellness',
    title: 'Wellness Reset',
    description: 'Guided breathwork, mood tracking, and restorative prompts.',
    badge: 'Soothing',
  },
  {
    id: 'retro',
    title: 'Retro Facilitator',
    description:
      'Gather highlights, frictions, and lessons learned with AI moderation.',
    badge: 'Team',
  },
];

export const Route = createFileRoute('/dashboard/meetings')({
  component: MeetingsPage,
});

function MeetingsPage() {
  const [meetings, setMeetings] =
    React.useState<ScheduledMeeting[]>(scheduledMeetings);
  const [selectedMeeting, setSelectedMeeting] =
    React.useState<ScheduledMeeting | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    (typeof quickStartTemplates)[number] | null
  >(null);

  const healthItems = [
    {
      label: 'Latency',
      status: 'Low (220ms)',
      icon: <Waves className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'OpenAI Realtime',
      status: 'All nodes online',
      icon: <MessageCircle className="h-4 w-4 text-sky-400" />,
    },
    {
      label: 'ElevenLabs Stream',
      status: 'Voice synthesis ready',
      icon: <Waves className="h-4 w-4 text-indigo-400" />,
    },
  ];

  const handleCreateMeeting = (draft: Omit<ScheduledMeeting, 'id'>) => {
    const id = `${draft.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setMeetings((previous) => [{ id, ...draft }, ...previous]);
  };

  const handleUpdateMeeting = (draft: Omit<ScheduledMeeting, 'id'>) => {
    if (!selectedMeeting) return;
    setMeetings((previous) =>
      previous.map((meeting) =>
        meeting.id === selectedMeeting.id ? { ...meeting, ...draft } : meeting
      )
    );
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = () => {
    if (!selectedMeeting) return;
    setMeetings((previous) =>
      previous.filter((meeting) => meeting.id !== selectedMeeting.id)
    );
    setSelectedMeeting(null);
    setEditorOpen(false);
  };

  const handleLaunchTemplate = () => {
    if (!selectedTemplate) return;
    const newMeeting = {
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      start: 'Today · 5:15 PM',
      duration: '30 mins',
      voice: 'Aurora · Creative Lead',
    };
    handleCreateMeeting(newMeeting);
    setTemplateDialogOpen(false);
  };

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
        />

        <SessionHealthCard healthItems={healthItems} />
      </section>

      <section>
        <QuickStartTemplatesCard
          templates={quickStartTemplates}
          onLaunch={(template) => {
            setSelectedTemplate(template);
            setTemplateDialogOpen(true);
          }}
        />
      </section>

      <MeetingEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initialMeeting={selectedMeeting}
        onSubmit={(draft) => {
          if (selectedMeeting) {
            handleUpdateMeeting(draft);
          } else {
            handleCreateMeeting(draft);
          }
          setEditorOpen(false);
        }}
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
