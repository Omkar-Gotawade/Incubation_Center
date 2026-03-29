import { api } from "./client";

interface BroadcastResponse {
  message: string;
  recipients_count: number;
}

export async function sendMeetingEmail(): Promise<BroadcastResponse> {
  const { data } = await api.post<BroadcastResponse>("/send-meeting-email");
  return data;
}
