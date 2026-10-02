import type { SeriesPoint } from '@/types/dashboard';
import type { Usage } from '@/types/api';

const dayLabel = (iso: string, withWeekday: boolean) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...(withWeekday ? { weekday: 'short' } : { month: 'short', day: 'numeric' }),
  });

/** Turn the API's daily series into chart points. 90 days is grouped into weeks. */
export function toSeries(usage: Usage): SeriesPoint[] {
  const days = usage.series;
  if (usage.range !== '90d') {
    return days.map((d) => ({
      label: dayLabel(d.date, usage.range === '7d'),
      requests: d.requests,
      assessments: d.assessments,
    }));
  }
  const weeks: SeriesPoint[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    weeks.push({
      label: dayLabel(chunk[0].date, false),
      requests: chunk.reduce((sum, d) => sum + d.requests, 0),
      assessments: chunk.reduce((sum, d) => sum + d.assessments, 0),
    });
  }
  return weeks;
}
