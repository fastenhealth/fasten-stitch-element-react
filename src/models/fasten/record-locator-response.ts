import { RecordLocatorFacility } from './record-locator-facility';

export interface RecordLocatorResponse {
  pending_patient_accounts: { [key: string]: RecordLocatorFacility };
  discovered_patient_accounts: { [key: string]: RecordLocatorFacility };
}
