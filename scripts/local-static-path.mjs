import path from 'node:path';

function isContained(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

// This is deliberately a single decode followed by an absolute containment
// check. A second decode is never needed to find a real local filename, and
// treating it as one would turn a literal percent-encoded filename into a path.
export function resolveLocalStaticPath(root, urlPath) {
  const rawPath = String(urlPath || '/').split('?')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const target = decoded === '/' || decoded === ''
    ? path.join(root, 'index.html')
    : path.resolve(root, `.${decoded.startsWith('/') ? decoded : `/${decoded}`}`);
  return isContained(root, target) ? target : null;
}
