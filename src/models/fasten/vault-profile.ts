export interface VaultProfile {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  org_id?: string;

  password_confirm?: string;
  agree_terms?: boolean;
}
