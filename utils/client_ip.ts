import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

/**
 * 获取客户端真实 IP 地址
 * @param ctx Oak 的上下文对象
 * @returns string 客户端 IP 地址
 */
export function getClientIP(ctx: Context): string {
  // 尝试从所有可能的来源获取 IP
  const ip = ctx.request.headers.get("x-forwarded-for")?.split(',')[0].trim() || 
            ctx.request.ip || 
            "unknown";

  console.log(ctx.request.headers);
  console.log(ctx.request.ip);

  // 验证 IP 是否有效（不是 0.0.0.0）
  return ip === "0.0.0.0" ? "unknown" : ip;

} 