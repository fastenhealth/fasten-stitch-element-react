import { ConnectMode } from '../../constants';

export interface ConnectPayload {
  public_id: string;
  brand_id: string;
  portal_id: string;
  endpoint_id: string;

  external_state?: string;

  org_connection_id?: string;
  external_id?: string;
  vault_profile_connection_id?: string;

  connect_mode?: ConnectMode;
}
