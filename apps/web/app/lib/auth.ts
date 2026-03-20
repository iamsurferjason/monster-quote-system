export type FrontendUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export function getCurrentUser(): FrontendUser | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FrontendUser;
  } catch {
    return null;
  }
}

export function hasRole(user: FrontendUser | null, roles: string[]) {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}