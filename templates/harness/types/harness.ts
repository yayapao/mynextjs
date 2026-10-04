import type {
  HarnessCapabilities,
  HarnessMessage,
  HarnessSessionLog,
  HarnessStreamEvent,
} from '@/harness/core';

export interface HarnessConversationSummary {
  id: string;
  title: string;
  updatedAt: number;
}

export interface HarnessInitialData {
  mode: 'demo' | 'openai';
  sessions: HarnessConversationSummary[];
  sessionId: string;
  messages: HarnessMessage[];
  capabilities: HarnessCapabilities;
  logs: HarnessSessionLog[];
}

export interface HarnessChatState {
  busy: boolean;
  error: string;
  progress: string;
  confirmation: Extract<
    HarnessStreamEvent,
    { type: 'confirmation_request' }
  > | null;
}
