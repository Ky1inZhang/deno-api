import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 获取客户端真实IP地址
function getClientIP(ctx: any): string {
  // 记录所有可能的IP来源
  const ipSources: Record<string, string | undefined> = {};

  // 1. 从连接信息获取
  try {
    const conn = ctx.request.serverRequest.conn;
    if (conn && conn.remoteAddr) {
      const addr = conn.remoteAddr as Deno.Addr;
      if ('hostname' in addr) {
        ipSources['remoteAddr'] = addr.hostname;
      }
    }
  } catch (e) {
    console.log('获取连接信息失败:', e);
  }

  // 2. 常见的代理头
  const proxyHeaders = [
    'CF-Connecting-IP',    // Cloudflare
    'X-Real-IP',          // Nginx
    'X-Forwarded-For',    // 通用
    'True-Client-IP',     // Akamai
    'X-Client-IP',        // 通用
    'X-Cluster-Client-IP',// 负载均衡
    'Fastly-Client-IP',   // Fastly CDN
    'X-Original-Forwarded-For',
    'Proxy-Client-IP',
    'WL-Proxy-Client-IP',
    'HTTP_CLIENT_IP',
    'HTTP_X_FORWARDED_FOR'
  ];

  for (const header of proxyHeaders) {
    const value = ctx.request.headers.get(header);
    if (value) {
      ipSources[header] = value.split(',')[0].trim();
    }
  }

  // 3. 检查Via头，可能包含代理信息
  const via = ctx.request.headers.get('Via');
  if (via) {
    ipSources['Via'] = via;
  }

  // 4. 获取原始请求IP
  ipSources['requestIP'] = ctx.request.ip;

  // 打印所有收集到的IP信息，用于调试
  console.log('收集到的所有IP信息:', JSON.stringify(ipSources, null, 2));

  // 按优先级返回IP
  // 优先使用 Cloudflare、可信代理和原始连接信息
  return ipSources['CF-Connecting-IP'] ||
         ipSources['True-Client-IP'] ||
         ipSources['X-Real-IP'] ||
         ipSources['remoteAddr'] ||
         ipSources['X-Forwarded-For'] ||
         ipSources['requestIP'] ||
         '未知IP';
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
    console.log("访问者IP信息:", clientIP);
    
    // 输出完整的请求头信息，用于调试
    console.log("完整的请求头信息:");
    for (const [key, value] of ctx.request.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // 如果无法获取到有效的IP地址
    if (clientIP === '未知IP') {
      throw new Error("无法获取访问者IP地址");
    }
    
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
    ctx.response.body = { 
      error: error.message,
      headers: Object.fromEntries(ctx.request.headers.entries()) // 在错误响应中包含请求头信息，方便调试
    };
  }
});

export default router; 