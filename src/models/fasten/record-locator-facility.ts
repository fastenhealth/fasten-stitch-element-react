import {
  LighthouseBrandListDisplayItem,
  LighthouseEndpointListDisplayItem,
  LighthousePortalListDisplayItem,
} from '../lighthouse/lighthouse-source-search';

export interface RecordLocatorFacility {
  brand: LighthouseBrandListDisplayItem;
  portal: LighthousePortalListDisplayItem;
  endpoint: LighthouseEndpointListDisplayItem;
  facility_id: string;
  display_name: string;
  facility_patient_id: string;
}
