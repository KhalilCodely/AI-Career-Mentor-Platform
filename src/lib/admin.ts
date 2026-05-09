export const ADMIN_EMAIL = "khaliloyoussef@gmail.com";
export const ADMIN_PASSWORD = "Admin12345";

export function normalizeAdminEmail(email: string) {
  return email.toLowerCase().trim();
}

export function isAdminEmail(email: string) {
  return normalizeAdminEmail(email) === ADMIN_EMAIL;
}

export function isAdminCredentials(email: string, password: string) {
  return isAdminEmail(email) && password === ADMIN_PASSWORD;
}
