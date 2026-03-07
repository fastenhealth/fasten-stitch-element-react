export interface PatientAccessEndpoint {
  id: string;
  url?: string;
  name?: string;
  description?: string;
  fhir_version?: string;
  authorization_url?: string;
  token_url?: string;
  introspection_url?: string;
  userinfo_url?: string;
  scopes_supported?: string[];
}

export interface PatientAccessPortal {
  id: string;
  name?: string;
  url?: string;
  description?: string;
  last_updated?: string;
  endpoint_ids?: string[];
}

export interface PatientAccessBrand {
  id: string;
  name: string;
  description?: string;
  logo_uri?: string;
  categories?: string[];
  aliases?: string[];
  portal_ids?: string[];
  last_updated?: string;
}
