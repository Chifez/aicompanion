import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MeetingDetail } from '@/types/api';

export type MeetingFormState = {
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  voiceProfile: string;
  visibility?: 'private' | 'public';
  inviteEmails?: string;
};

export function useMeetingMutations() {
  const queryClient = useQueryClient();

  const createMeeting = useMutation({
    mutationFn: async (draft: MeetingFormState & { isInstant?: boolean }) => {
      const payload = {
        title: draft.title,
        description: draft.description,
        startTime: draft.startTime,
        durationMinutes: draft.durationMinutes,
        voiceProfile: draft.voiceProfile,
        aiPersonaId: 'aurora',
        agenda: [] as {
          title: string;
          description: string;
          durationMinutes: number;
        }[],
        // Add flag to indicate instant meeting
        isInstant: draft.isInstant ?? false,
        visibility: draft.visibility ?? 'private',
      };
      const response = await apiClient.post<{ meeting: MeetingDetail }>(
        '/meetings',
        payload
      );
      return response.data.meeting;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
      void queryClient.invalidateQueries({
        queryKey: ['dashboard', 'overview'],
      });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({
      id,
      draft,
    }: {
      id: string;
      draft: MeetingFormState;
    }) => {
      const payload = {
        title: draft.title,
        description: draft.description,
        startTime: draft.startTime,
        durationMinutes: draft.durationMinutes,
        voiceProfile: draft.voiceProfile,
        aiPersonaId: 'aurora',
        agenda: [] as {
          title: string;
          description: string;
          durationMinutes: number;
        }[],
      };
      const response = await apiClient.patch<{ meeting: MeetingDetail }>(
        `/meetings/${id}`,
        payload
      );
      return response.data.meeting;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/meetings/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });

  const startMeeting = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<{ meeting: MeetingDetail }>(
        `/meetings/${id}/start`
      );
      return response.data.meeting;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meetings'] });
      void queryClient.invalidateQueries({
        queryKey: ['dashboard', 'overview'],
      });
    },
  });

  return { createMeeting, updateMeeting, deleteMeeting, startMeeting };
}
