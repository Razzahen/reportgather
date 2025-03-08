
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface StoreFilter {
  storeIds: string[] | 'all';
  dateRange: {
    from: Date;
    to: Date;
  };
}
