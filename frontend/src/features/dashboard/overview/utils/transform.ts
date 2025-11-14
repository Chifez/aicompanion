import type { DashboardOverviewResponse } from '@/types/api';
import { formatMinutes, formatStartTime } from './format';

export function transformFocusItems(
  data: DashboardOverviewResponse | undefined
) {
  if (!data) {
    return [];
  }
  return [
    {
      icon: 'flame' as const,
      copy: data.upcomingFocus.focusArea,
    },
    {
      icon: 'messages' as const,
      copy: `Starts ${formatStartTime(data.upcomingFocus.startTime)} · ${data.upcomingFocus.durationMinutes} mins`,
    },
  ];
}

export function transformRecentSessions(
  data: DashboardOverviewResponse | undefined
) {
  if (!data) {
    return [];
  }
  return data.recentSessions.map((session) => ({
    id: session.id,
    title: session.title,
    duration: formatMinutes(session.durationMinutes),
    sentiment: session.sentiment || 'neutral',
    summary:
      session.actionSummary || session.focus || 'Review session insights.',
  }));
}

export function transformInsights(data: DashboardOverviewResponse | undefined) {
  if (!data) {
    return [];
  }
  return data.insightMetrics.map((metric) => ({
    title: metric.label,
    value: metric.value,
    delta: `${metric.direction === 'down' ? '-' : '+'}${Math.abs(metric.delta)}`,
    description: metric.label,
  }));
}

export function transformStreak(data: DashboardOverviewResponse | undefined) {
  if (!data) {
    return [] as { day: string; mark: string }[];
  }
  const days = Math.max(data.streak.longest, 7);
  return Array.from({ length: days }, (_, index) => ({
    day: `Day ${index + 1}`,
    mark: index < data.streak.current ? '✓' : '•',
  }));
}
