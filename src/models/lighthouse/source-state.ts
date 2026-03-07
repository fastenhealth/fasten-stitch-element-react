export interface SourceState {
  state: string;
  endpoint_id: string;
  portal_id: string;
  brand_id: string;
  org_connection_id: string;
  code_verifier: string;
  code_challenge: string;
  code_challenge_method: string;
  redirect_uri: string;
}
