export function hasVerifiedOpenAIEmail(entries) {
  if (!Array.isArray(entries)) return false;

  return entries.some((entry) => {
    if (!entry || entry.verified !== true || typeof entry.email !== 'string') {
      return false;
    }

    const separator = entry.email.lastIndexOf('@');
    return separator > 0
      && entry.email.slice(separator + 1).toLowerCase() === 'openai.com';
  });
}
