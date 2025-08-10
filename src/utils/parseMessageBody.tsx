export function parseMessageBody(body: string, _belongToCurrentUser?: boolean): string {
  if (!body) return "";
  return body.replace(/[\u200B-\u200D\uFEFF]/g, "");
}