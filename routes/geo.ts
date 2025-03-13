import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 类型断言函数：确保地址是网络地址
function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!["tcp", "udp"].includes(addr.transport)) {
    throw new Error("不是有效的网络地址");
  }
}

// 获取客户端真实IP地址
function getClientIP(ctx: any): string {
  try {
    // 获取原始的连接信息
    const serverRequest = ctx.request.originalRequest?.serverRequest;
    if (!serverRequest) {
      throw new Error("无法获取服务器请求信息");
    }

    const connInfo = serverRequest.conn;
    if (!connInfo) {
      throw new Error("无法获取连接信息");
    }

    const remoteAddr = connInfo.remoteAddr;
    assertIsNetAddr(remoteAddr);

    // 返回远程主机地址
    return remoteAddr.hostname;
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
    // 从连接信息获取客户端IP
    const clientIP = getClientIP(ctx);
    console.log("访问者IP信息:", clientIP);
    
    // 输出连接信息，用于调试
    try {
      const serverRequest = ctx.request.originalRequest?.serverRequest;
      if (serverRequest?.conn) {
        console.log("连接信息:", {
          localAddr: serverRequest.conn.localAddr,
          remoteAddr: serverRequest.conn.remoteAddr,
          rid: serverRequest.conn.rid,
          transport: serverRequest.conn.transport,
        });
      }
    } catch (e) {
      console.error("获取连接信息失败:", e);
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
      debug: {
        headers: Object.fromEntries(ctx.request.headers.entries()),
        connection: ctx.request.originalRequest?.serverRequest?.conn 
          ? {
              localAddr: ctx.request.originalRequest.serverRequest.conn.localAddr,
              remoteAddr: ctx.request.originalRequest.serverRequest.conn.remoteAddr,
              rid: ctx.request.originalRequest.serverRequest.conn.rid,
              transport: ctx.request.originalRequest.serverRequest.conn.transport,
            }
          : "无连接信息"
      }
    };
  }
});

export default router; 