import { eachDayOfInterval, endOfDay, isWeekend, startOfDay } from 'date-fns';
import { isHoliday } from 'feiertagejs';
import { getSummaryReport, SummaryReportResponse } from './clockifyApi';

export interface OvertimeResult {
  allocatedSeconds: number;
  businessSeconds: number;
  overtimeSeconds: number;
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
  return calculateOvertime(report, startDate, endDate, hoursPerDay);
}

export function calculateOvertime(report: SummaryReportResponse, startDate: Date, endDate: Date, hoursPerDay: number): OvertimeResult {
  const allocatedSeconds = report.groupOne[0].duration;

  const dayCount = eachDayOfInterval({ start: startDate, end: endDate }).filter((date) => !isWeekend(date) && !isHoliday(date, 'BY'))
    .length;
  const businessSeconds = dayCount * hoursPerDay * 60 * 60;

  const overtimeSeconds = allocatedSeconds - businessSeconds;
  return { allocatedSeconds, businessSeconds, overtimeSeconds };
}
