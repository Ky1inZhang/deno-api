import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

/**
 * 获取客户端真实 IP 地址
 * @param ctx Oak 的上下文对象
 * @returns string 客户端 IP 地址
 */
export function getClientIP(ctx: Context): string {
  // 优先使用 X-Forwarded-For（用于代理环境，如 Deno Deploy）
  const forwardedFor = ctx.request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // 使用 Oak 的内置 IP 获取方法
  return ctx.request.ip || "unknown";
} 