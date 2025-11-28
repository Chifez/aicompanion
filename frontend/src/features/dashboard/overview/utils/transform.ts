import type { DashboardOverviewResponse } from '@/types/api';
import { formatMinutes, formatStartTime } from './format';

export function transformFocusItems(
  data: DashboardOverviewResponse | undefined
) {
  if (
    !data ||
    !data.upcomingFocus.focusArea ||
    data.upcomingFocus.focusArea.trim() === ''
  ) {
    return [];
  }

  // Only return items if we have valid data
  const items = [];

  if (
    data.upcomingFocus.focusArea &&
    data.upcomingFocus.focusArea.trim() !== ''
  ) {
    items.push({
      icon: 'flame' as const,
      copy: data.upcomingFocus.focusArea,
    });
  }

  if (data.upcomingFocus.startTime && data.upcomingFocus.durationMinutes > 0) {
    items.push({
      icon: 'messages' as const,
      copy: `Starts ${formatStartTime(data.upcomingFocus.startTime)} · ${data.upcomingFocus.durationMinutes} mins`,
    });
  }

  return items;
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
  if (!data || (data.streak.current === 0 && data.streak.longest === 0)) {
    return [] as { day: string; mark: string }[];
  }
  // Show last 7 days or longest streak, whichever is greater (min 7 days)
  const days = Math.max(data.streak.longest, data.streak.current, 7);
  return Array.from({ length: days }, (_, index) => ({
    day: `Day ${index + 1}`,
    mark: index < data.streak.current ? '✓' : '•',
  }));
}
