/**
 * Sanitizes a redirect URL by removing spaces and ensuring it's a valid path
 */
export function sanitizeRedirectUrl(redirectPath: string | undefined): string {
  if (!redirectPath || typeof redirectPath !== 'string') {
    return '/dashboard';
  }

  // Remove leading/trailing whitespace
  let sanitized = redirectPath.trim();

  // Remove all spaces
  sanitized = sanitized.replace(/\s+/g, '');

  // Ensure it starts with /
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }

  // Remove any dangerous characters but keep /
  sanitized = sanitized.replace(/[\n\r\t]/g, '');

  // Only allow relative paths (no protocol, host, etc.)
  try {
    const url = new URL(sanitized, 'http://localhost');
    // If it has a host, it's not a relative path - reject it
    if (url.host !== 'localhost') {
      return '/dashboard';
    }
  } catch {
    // Invalid URL, but that's okay for relative paths
  }

  // Final validation: ensure it's a safe path
  if (!/^\/[a-zA-Z0-9\-_/]*$/.test(sanitized)) {
    return '/dashboard';
  }

  return sanitized || '/dashboard';
}
