export function parseDbUrl(urlStr: string) {
  const u = new URL(urlStr);
  return {
    host: u.hostname,
    port: Number(u.port || '3306'),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password || ''),
    database: u.pathname.replace(/^\//, ''),
  };
}
