import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 获取客户端真实IP地址
function getClientIP(ctx: any): string {
  try {
    // 1. 尝试从原始请求的连接信息获取IP
    const connInfo = ctx.request?.originalRequest?.conn;
    if (connInfo?.remoteAddr?.hostname) {
      console.log("从连接信息获取到IP:", connInfo.remoteAddr.hostname);
      return connInfo.remoteAddr.hostname;
    }

    // 2. 尝试从ctx.request.serverRequest获取
    const serverRequest = ctx.request?.serverRequest;
    if (serverRequest?.conn?.remoteAddr?.hostname) {
      console.log("从serverRequest获取到IP:", serverRequest.conn.remoteAddr.hostname);
      return serverRequest.conn.remoteAddr.hostname;
    }

    // 3. 尝试从请求对象获取IP
    const ip = ctx.request.ip;
    console.log("从request.ip获取到:", ip);
    
    // 如果是 IPv6 格式的 ::ffff:IPv4，提取出 IPv4 部分
    if (ip && ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    
    // 如果是普通的 IP 地址，直接返回
    if (ip && ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
      return ip;
    }

    // 4. 尝试从各种请求头获取
    const headers = {
      cfIP: ctx.request.headers.get("cf-connecting-ip"),
      xRealIP: ctx.request.headers.get("x-real-ip"),
      xForwardedFor: ctx.request.headers.get("x-forwarded-for"),
      xClientIP: ctx.request.headers.get("x-client-ip"),
      xOriginalForwardedFor: ctx.request.headers.get("x-original-forwarded-for")
    };

    console.log("从请求头获取到的IP信息:", headers);

    // 按优先级返回
    return headers.cfIP || 
           headers.xRealIP || 
           (headers.xForwardedFor && headers.xForwardedFor.split(',')[0].trim()) ||
           headers.xClientIP ||
           headers.xOriginalForwardedFor ||
           ip ||
           "未知IP";

  } catch (error) {
    console.error("获取IP地址时出错:", error);
    return "未知IP";
  }
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
    console.log("最终选择的IP:", clientIP);

    // 输出完整的连接信息用于调试
    console.log("连接信息:", {
      originalRequest: {
        conn: ctx.request?.originalRequest?.conn,
        remoteAddr: ctx.request?.originalRequest?.conn?.remoteAddr
      },
      serverRequest: {
        conn: ctx.request?.serverRequest?.conn,
        remoteAddr: ctx.request?.serverRequest?.conn?.remoteAddr
      }
    });
    
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
      debug: {
        requestIP: ctx.request.ip,
        originalConn: ctx.request?.originalRequest?.conn,
        serverConn: ctx.request?.serverRequest?.conn,
        headers: Object.fromEntries(ctx.request.headers.entries())
      }
    };
  }
});

export default router; 