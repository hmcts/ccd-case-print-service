export function encodePathSegment(pathSegment): string {
  return encodeURIComponent(String(pathSegment));
}
