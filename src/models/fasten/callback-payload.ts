export interface VaultAuthFinishResponse {
  has_verified_identity?: boolean;
  verified_identity_csp_type?: string;
  verified_identity_patient_demographics?: Record<string, unknown>;
}

export interface CallbackPayload {
  org_connection_id?: string;
  endpoint_id?: string;
  brand_id?: string;
  portal_id?: string;
  connection_status?: string;
  platform_type?: string;
  scope?: string;
  consent_expires_at?: string;

  request_id?: string;
  external_state?: string;
  external_id?: string;
  error?: string;
  error_description?: string;
  vault_profile_connection_id?: string;
  patient_auth_type?: string;

  vault_auth_finish_response?: VaultAuthFinishResponse;
  tefca_directory_id?: string;
}
