export function getGoogleClientId() {
  if (typeof window !== 'undefined') {
    const customId = localStorage.getItem('CUSTOM_GOOGLE_CLIENT_ID');
    if (customId) return customId;
  }
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export const isGoogleConfigured = () => {
  if (typeof window !== 'undefined') {
    return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !!localStorage.getItem('CUSTOM_GOOGLE_CLIENT_ID');
  }
  return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
};

export function initiateGoogleAuth() {
  const clientId = getGoogleClientId();
  if (!clientId) {
    console.warn("Google Client ID not configured.");
    return false;
  }
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
  const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.appdata';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=consent`;

  window.location.href = authUrl;
  return true;
}

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Google profile. Token might be invalid or expired.");
  }
  return res.json();
}
