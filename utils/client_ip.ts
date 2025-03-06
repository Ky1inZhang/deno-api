import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

/**
 * 获取客户端真实 IP 地址
 * @param ctx Oak 的上下文对象
 * @returns string 客户端 IP 地址
 */
export function getClientIP(ctx: Context): string {
  // 从请求头获取 IP
  const forwardedFor = ctx.request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // 如果有多个 IP，取第一个（最原始的客户端 IP）
    return forwardedFor.split(',')[0].trim();
  }

  // 获取 remoteAddr
  const remoteAddr = ctx.request.ip;
  if (remoteAddr) {
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
    if (ip) {
      return ip.trim();
    }
  }

  return "unknown";
} 