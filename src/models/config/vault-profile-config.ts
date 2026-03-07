import { CspType } from '../../constants';
import { PatientDemographics } from '../fasten/patient-demographics';
import { ConnectedPatientAccount } from './connected-patient-account';
import {
  LighthouseBrandListDisplayItem,
  LighthouseEndpointListDisplayItem,
  LighthousePortalListDisplayItem,
} from '../lighthouse/lighthouse-source-search';

export interface PendingOrDiscoveredAccount {
  vault_profile_connection_id?: string;
  brand: LighthouseBrandListDisplayItem;
  portal: LighthousePortalListDisplayItem;
  endpoint: LighthouseEndpointListDisplayItem;
}

export interface VaultProfileConfig {
  identityVerificationFailureCount?: number;
  verifiedIdentityCspType?: CspType;
  verifiedIdentityPatientDemographics?: PatientDemographics;

  rlsQueryComplete?: boolean;

  connectedPatientAccounts?: ConnectedPatientAccount[];

  pendingPatientAccounts?: {
    [key: string]: PendingOrDiscoveredAccount;
  };

  discoveredPatientAccounts?: {
    [key: string]: PendingOrDiscoveredAccount;
  };
}
