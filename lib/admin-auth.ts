export const ADMIN_SESSION_COOKIE = "vantage_admin_session";

export function getAdminPasscode() {
  return process.env.ADMIN_PASSCODE ?? "";
}

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "";
}
