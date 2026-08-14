export function buildGithubAuthStartUrl({
  base = '',
  origin,
  verifyEmail = false,
} = {}) {
  if (typeof origin !== 'string' || !origin) {
    throw new TypeError('A browser origin is required to start GitHub sign-in');
  }

  const params = new URLSearchParams({ origin });
  if (verifyEmail) params.set('verify_email', '1');
  return `${base}/auth/github?${params.toString()}`;
}
