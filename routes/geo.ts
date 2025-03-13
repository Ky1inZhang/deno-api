import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 获取客户端真实IP地址
function getClientIP(ctx: any): string {
  // 按优先级获取IP
  // 1. CF-Connecting-IP (Cloudflare)
  const cfIP = ctx.request.headers.get("CF-Connecting-IP");
  if (cfIP) return cfIP;

  // 2. X-Real-IP
  const realIP = ctx.request.headers.get("X-Real-IP");
  if (realIP) return realIP;

  // 3. X-Forwarded-For
  const forwardedFor = ctx.request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // 取第一个IP（最原始的客户端IP）
    return forwardedFor.split(",")[0].trim();
  }

  // 4. 远程地址
  return ctx.request.ip;
}

// 获取时区偏移量
function getTimezoneOffset(timezone: string): number {
  try {
    const date = new Date();
    const options = { timeZone: timezone, timeZoneName: "short" } as const;
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);
    const offset = parts.find(part => part.type === "timeZoneName")?.value || "";
    const hours = parseInt(offset.replace(/[^+-]/g, "").split(":")[0]);
    return hours;
  } catch {
    return 0;
  }
}

router.get("/geo", oakCors(), async (ctx) => {
  try {
    // 从请求中获取客户端IP
    const clientIP = getClientIP(ctx);
    console.log("访问者IP:", clientIP);
    
    // 调用 ipinfo.io API
    const response = await fetch(`https://ipinfo.io/widget/demo/${clientIP}`);
    const data = await response.json();
    console.log("ipinfo.io响应:", data);
    
    if (!data.data) {
      throw new Error("Failed to fetch IP info");
    }

    const ipInfo = data.data;
    const [latitude, longitude] = ipInfo.loc.split(",").map(Number);
    const timezoneOffset = getTimezoneOffset(ipInfo.timezone);

    // 构造目标格式的响应
    const result = {
      time_zone: {
        name: ipInfo.timezone,
        offset_with_dst: timezoneOffset
      },
      ip: ipInfo.ip,
      country_name: ipInfo.country,
      country_code2: ipInfo.country,
      city: ipInfo.city,
      longitude: longitude,
      latitude: latitude,
      src: "l",
      country_flag: `https://ipgeolocation.io/static/flags/${ipInfo.country.toLowerCase()}_64.png`,
      languages: "en" // 默认英语，可以根据国家代码扩展
    };

    ctx.response.body = result;
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

export default router; 