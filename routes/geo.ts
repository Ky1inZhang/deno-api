import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

// 国家时区映射表
const COUNTRY_TIMEZONE_OFFSETS: Record<string, number> = {
  "JP": 9,    // 日本
  "CN": 8,    // 中国
  "KR": 9,    // 韩国
  "AU": 10,   // 澳大利亚
  "US": -5,   // 美国（东部时间）
  "GB": 0,    // 英国
  "DE": 1,    // 德国
  "FR": 1,    // 法国
  "RU": 3,    // 俄罗斯（莫斯科）
  "SG": 8,    // 新加坡
  "IN": 5.5,  // 印度
  "AE": 4,    // 阿联酋
};

// 获取时区偏移量
function getTimezoneOffset(country: string, timezone: string): number {
  // 优先使用国家代码查找固定偏移
  if (COUNTRY_TIMEZONE_OFFSETS[country]) {
    return COUNTRY_TIMEZONE_OFFSETS[country];
  }

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

    // 从环境变量获取 token
    const token = Deno.env.get("IPINFO_TOKEN");
    if (!token) {
      ctx.response.status = 500;
      ctx.response.body = { error: "未配置 IPINFO_TOKEN 环境变量" };
      return;
    }
    
    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`);
    const ipInfo = await response.json();
    
    if (!ipInfo || ipInfo.error) {
      ctx.response.status = 502;
      ctx.response.body = { error: "无法从上游服务获取IP信息" };
      return;
    }

    const [latitude, longitude] = (ipInfo.loc || "0,0").split(",").map(Number);
    const timezoneOffset = getTimezoneOffset(ipInfo.country, ipInfo.timezone);

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