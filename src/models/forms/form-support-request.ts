export interface FormSupportRequest {
  healthsystem_name: string;
  email: string;
  request_content: string;
  org_id: string;
  org_name: string;
  version: string;
  arch: string;
  os: string;

  error?: string;
  error_description?: string;
  brand_id?: string;
  portal_id?: string;
  endpoint_id?: string;
  org_connection_id?: string;
  external_id?: string;
  external_state?: string;
  request_id?: string;
}
