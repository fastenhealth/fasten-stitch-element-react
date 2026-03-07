// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export { FastenStitchElement } from './components/FastenStitchElement';
export type {
  FastenStitchElementProps,
  FastenStitchElementHandle,
} from './components/FastenStitchElement';

// ---------------------------------------------------------------------------
// Constants & Enums
// ---------------------------------------------------------------------------
export {
  ApiMode,
  WidgetMode,
  ConnectionStatus,
  ConnectMode,
  CspType,
  SourceCredentialType,
  EventTypes,
  SDKMode,
  CommunicationEntity,
  ConnectWindowTimeout,
} from './constants';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

// Config
export type { SearchConfig } from './models/config/search-config';
export type { SystemConfig } from './models/config/system-config';
export type {
  VaultProfileConfig,
  PendingOrDiscoveredAccount,
} from './models/config/vault-profile-config';
export type { ConnectedPatientAccount } from './models/config/connected-patient-account';

// Fasten
export type {
  CallbackPayload,
  VaultAuthFinishResponse,
} from './models/fasten/callback-payload';
export type {
  VaultConnectionOrgAuthorizeResponse,
  CallbackTemplateDataResponse,
  FailureResponse,
} from './models/fasten/vault-connection-org-authorize-response';
export type { ConnectPayload } from './models/fasten/connect-payload';
export type { ConnectErrorData } from './models/fasten/connect-error-data';
export type { Organization } from './models/fasten/organization';
export type { OrganizationConnection } from './models/fasten/organization-connection';
export type { RecordLocatorFacility } from './models/fasten/record-locator-facility';
export type { RecordLocatorResponse } from './models/fasten/record-locator-response';
export type { VaultProfile } from './models/fasten/vault-profile';
export type { SearchQueryPayload } from './models/fasten/search-query-payload';
export type { GeocodeResponse } from './models/fasten/geocode-response';
export type {
  PatientDemographics,
  AddressInformation,
  PatientName,
} from './models/fasten/patient-demographics';

// Forms
export type { FormHealthSystemRequest } from './models/forms/form-health-system-request';
export type { FormSupportRequest } from './models/forms/form-support-request';
export type { ZendeskTicket } from './models/forms/zendesk-ticket';

// Lighthouse
export type { LighthouseSourceMetadata } from './models/lighthouse/lighthouse-source-metadata';
export type {
  LighthouseEndpointListDisplayItem,
  LighthousePortalListDisplayItem,
  LighthouseBrandListDisplayItem,
  LighthouseSourceSearchResult,
  LighthouseSourceSearchAggregation,
  LighthouseSourceSearch,
} from './models/lighthouse/lighthouse-source-search';
export type { SourceState } from './models/lighthouse/source-state';

// Message Bus
export type { MessageBusEventPayload } from './models/message-bus/message-bus-event-payload';

// Patient Access Brands
export type {
  PatientAccessEndpoint,
  PatientAccessPortal,
  PatientAccessBrand,
} from './models/patient-access-brands';

// Search
export type { SearchFilter } from './models/search/search-filter';
export type { SearchSourceListItem } from './models/search/search-source-list-item';

// Response Wrapper
export type { ResponseWrapper } from './models/response-wrapper';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
export { Base64UrlEncode, Base64UrlDecode } from './utils/base64';
