import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 获取时区偏移量
function getTimezoneOffset(timezone: string): number {
  try {
    const date = new Date();
    const utcTime = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const tzTime = date.toLocaleString('en-US', { timeZone: timezone });
    const utcDate = new Date(utcTime);
    const tzDate = new Date(tzTime);
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

// 验证IP地址格式
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  const parts = ip.split('.').map(Number);
  return parts.every(part => part >= 0 && part <= 255);
}

router.get("/geo/:ip", oakCors(), async (ctx) => {
  try {
    const ip = ctx.params.ip;
    if (!ip) {
      ctx.response.status = 400;
      ctx.response.body = { error: "请提供IP地址参数" };
      return;
    }

    if (!isValidIP(ip)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "无效的IP地址格式" };
      return;
    }
    
    const response = await fetch(`https://ipinfo.io/widget/demo/${ip}`);
    const data = await response.json();
    
    if (!data.data) {
      ctx.response.status = 502;
      ctx.response.body = { error: "无法从上游服务获取IP信息" };
      return;
    }

    const ipInfo = data.data;
    const [latitude, longitude] = ipInfo.loc.split(",").map(Number);
    const timezoneOffset = getTimezoneOffset(ipInfo.timezone);

    ctx.response.body = {
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
      languages: "en"
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "服务器内部错误",
      detail: error.message
    };
  }
});

export default router; 