import { ApiMode, ConnectMode, EventTypes, SDKMode } from '../../constants';
import { Organization } from '../fasten/organization';

export interface SystemConfig {
  publicId: string;
  apiMode: ApiMode;
  org?: Organization;
  org_id?: string;
  reconnectOrgConnectionId?: string;
  externalId?: string;

  staticBackdrop?: boolean;
  searchOnly?: boolean;

  tefcaMode?: boolean;
  tefcaCspPromptForce?: boolean;

  eventTypes?: EventTypes[];
  sdkMode?: SDKMode;
  connectMode?: ConnectMode;
}
