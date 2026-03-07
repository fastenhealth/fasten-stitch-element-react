export interface SearchQueryPayload {
  query: string;
  timestamp?: number;
  filter?: {
    locations?: string[];
  };
  external_id?: string;
  results?: {
    total?: number;
  };
}
