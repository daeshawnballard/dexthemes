import oauthProtectedResourceHandler from '../server/oauth-protected-resource.js';

export default function handler(req, res) {
  if (req.query?.profile === 'oauth-protected-resource') {
    return oauthProtectedResourceHandler(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    statsigClientKey: process.env.STATSIG_CLIENT_KEY || '',
  });
}
