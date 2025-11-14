export const formatTranscriptDate = (iso: string, durationMinutes: number) => {
  const date = new Date(iso);
  const formattedDate = Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
  return `${formattedDate} • ${durationMinutes} mins`;
};
