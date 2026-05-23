export function apiUrl(path: string): string {
  return `https://${process.env.EXPO_PUBLIC_DOMAIN}${path}`;
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Something went wrong";
}
