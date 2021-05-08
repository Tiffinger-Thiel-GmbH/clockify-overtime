import { eachDayOfInterval, endOfDay, formatISO, isWeekend, startOfDay } from 'date-fns';
import { isHoliday } from 'feiertagejs';
import { getSummaryReport, SummaryReportResponse } from './clockifyApi';

export interface OvertimeResult {
  allocatedSeconds: number;
  businessSeconds: number;
  overtimeSeconds: number;
  missingDates: Date[];
}

export async function requestAndCalculateOvertime(
  apiKey: string,
  userId: string,
  workspaceId: string,
  startDate: Date,
  endDate: Date,
  hoursPerDay: number
): Promise<OvertimeResult> {
  const report = await getSummaryReport(apiKey, userId, workspaceId, startOfDay(startDate), endOfDay(endDate));
  console.log(report);
  return calculateOvertime(report, startDate, endDate, hoursPerDay);
}

export function calculateOvertime(report: SummaryReportResponse, startDate: Date, endDate: Date, hoursPerDay: number): OvertimeResult {
  const allocatedSeconds = report.groupOne[0].duration;

  const dayCount = eachDayOfInterval({ start: startDate, end: endDate }).filter((date) => !isWeekend(date) && !isHoliday(date, 'BY'))
    .length;
  const businessSeconds = dayCount * hoursPerDay * 60 * 60;

  const overtimeSeconds = allocatedSeconds - businessSeconds;

  const missingDates = eachDayOfInterval({ start: startDate, end: endDate }).filter(
    (date) =>
      !isWeekend(date) &&
      !isHoliday(date, 'BY') &&
      !report.groupOne[0].children.some((dayEntry) => dayEntry.name === formatISO(date, { representation: 'date' }))
  );

  return { allocatedSeconds, businessSeconds, overtimeSeconds, missingDates };
}
