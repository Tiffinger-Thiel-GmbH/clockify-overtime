import axios from 'axios';

const BASE_URL = 'https://api.clockify.me/api/v1';
const REPORT_BASE_URL = 'https://reports.api.clockify.me/v1';

const clockify = axios.create({ baseURL: BASE_URL, validateStatus: (status) => status < 400 });
const report = axios.create({ baseURL: REPORT_BASE_URL, validateStatus: (status) => status < 400 });

export interface CurrentUserResponse {
  id: string;
  activeWorkspace: string;
  defaultWorkspace: string;
  email: string;
  name: string;
  profilePicture: string;
}

export async function getCurrentUser(apiKey: string): Promise<CurrentUserResponse> {
  const response = await clockify.get<CurrentUserResponse>('/user', { baseURL: BASE_URL, headers: { 'X-Api-Key': apiKey } });
  return response.data;
}

export interface ClockifyWorkspace {
  id: string;
  name: string;
}

export type WorkspacesResponse = ReadonlyArray<ClockifyWorkspace>;

export async function getWorkspaces(apiKey: string): Promise<WorkspacesResponse> {
  const response = await clockify.get<WorkspacesResponse>('/workspaces', { baseURL: BASE_URL, headers: { 'X-Api-Key': apiKey } });
  return response.data;
}

export interface SummaryReportResponse {
  totals: [
    {
      totalTime: number;
      totalBillableTime: number;
      entriesCount: number;
      totalAmount: number;
    }
  ];
  groupOne: [
    {
      duration: number;
      amount: number;
      name: string;
      children: [{ name: string; duration: number }];
    }
  ];
}

export async function getSummaryReport(
  apiKey: string,
  userId: string,
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<SummaryReportResponse> {
  const response = await report.post<SummaryReportResponse>(
    `/workspaces/${workspaceId}/reports/summary`,
    {
      dateRangeStart: startDate.toISOString(),
      dateRangeEnd: endDate.toISOString(),
      summaryFilter: {
        groups: ['USER', 'DATE']
      },
      users: {
        ids: [userId],
        contains: 'CONTAINS',
        status: 'ALL'
      },
      amountShown: 'HIDE_AMOUNT'
    },
    {
      baseURL: REPORT_BASE_URL,
      headers: { 'X-Api-Key': apiKey }
    }
  );
  return response.data;
}
