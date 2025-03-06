/**
 * 获取客户端真实 IP 地址
 * @param ctx Oak 的上下文对象
 * @returns string 客户端 IP 地址
 */
export function getClientIP(headers: Headers): string {
  // 按优先级获取 IP
  const ip = headers.get("x-forwarded-for") || // 代理转发的 IP
    headers.get("x-real-ip") || // Nginx 设置的真实 IP
    headers.get("cf-connecting-ip") || // Cloudflare 的 IP
    headers.get("true-client-ip"); // 其他 CDN 的真实 IP

  if (ip) {
    // 如果是多个 IP（代理链），取第一个
    return ip.split(',')[0].trim();
  }

  return "unknown";
} 