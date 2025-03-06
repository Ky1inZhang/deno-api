import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

/**
 * 获取客户端真实 IP 地址
 * @param ctx Oak 的上下文对象
 * @returns string 客户端 IP 地址
 */
export function getClientIP(ctx: Context): string {
  console.log("=== 开始获取客户端 IP ===");
  console.log("原始请求信息:", {
    url: ctx.request.url.toString(),
    method: ctx.request.method,
    headers: Object.fromEntries(ctx.request.headers.entries())
  });

  // 从请求头获取 IP
  const forwardedFor = ctx.request.headers.get("x-forwarded-for");
  console.log("X-Forwarded-For:", forwardedFor);
  if (forwardedFor) {
    const clientIP = forwardedFor.split(',')[0].trim();
    console.log("从 X-Forwarded-For 获取到 IP:", clientIP);
    return clientIP;
  }

  // 获取 remoteAddr
  const remoteAddr = ctx.request.ip;
  console.log("RemoteAddr:", remoteAddr);
  if (remoteAddr) {
    console.log("从 remoteAddr 获取到 IP:", remoteAddr);
    return remoteAddr;
  }

  // 其他头部字段
  const alternativeHeaders = [
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip"
  ];

  for (const header of alternativeHeaders) {
    const ip = ctx.request.headers.get(header);
    console.log(`检查 ${header}:`, ip);
    if (ip) {
      console.log(`从 ${header} 获取到 IP:`, ip.trim());
      return ip.trim();
    }
  }

  console.log("未能获取到有效的 IP 地址");
  return "unknown";
} 