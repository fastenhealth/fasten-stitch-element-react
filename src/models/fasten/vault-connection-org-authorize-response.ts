export interface CallbackTemplateDataResponse {
  org_connection_id?: string;
  platform_type?: string;
  connection_status?: string;
  tefca_directory_id?: string;
}

export interface FailureResponse {
  error: string;
  error_description: string;
}

export interface VaultConnectionOrgAuthorizeResponse {
  request_id?: string;
  successes: Record<string, CallbackTemplateDataResponse>;
  failures: Record<string, FailureResponse>;
}
