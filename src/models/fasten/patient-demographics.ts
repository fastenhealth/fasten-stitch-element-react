export interface PatientDemographics {
  addressInformation: AddressInformation[];
  patientName: PatientName[];
  gender: string;
  birthDate: string;
}

export interface AddressInformation {
  street: string;
  unit: unknown;
  city: string;
  state: string;
  zip: string;
  country: string;
  county: string;
}

export interface PatientName {
  given: string[];
  family: string;
  suffix: unknown;
}
