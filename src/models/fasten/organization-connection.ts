import { ApiMode, ConnectionStatus } from '../../constants';

export interface OrganizationConnection {
  org_connection_id: string;
  org_id: string;
  catalog_endpoint_id: string;
  catalog_portal_id: string;
  catalog_brand_id: string;
  platform_type: string;
  api_mode: ApiMode;
  status: ConnectionStatus;
}
