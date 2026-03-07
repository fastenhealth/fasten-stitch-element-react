import {
  LighthouseBrandListDisplayItem,
  LighthouseEndpointListDisplayItem,
  LighthousePortalListDisplayItem,
} from '../lighthouse/lighthouse-source-search';

export interface ConnectedPatientAccount {
  org_connection_id: string;
  vault_profile_connection_id?: string;
  patient_auth_type?: string;
  connection_status: string;
  platform_type: string;
  scope?: string;
  consent_expires_at?: string;
  tefca_directory_id?: string;
  brand?: LighthouseBrandListDisplayItem;
  portal?: LighthousePortalListDisplayItem;
  endpoint?: LighthouseEndpointListDisplayItem;
}
