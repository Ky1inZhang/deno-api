import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { getIP } from "https://deno.land/x/get_ip/mod.ts";

const router = new Router();

// 获取时区偏移量
function getTimezoneOffset(timezone: string): number {
  try {
    const date = new Date();
    const options = { timeZone: timezone, timeZoneName: "shortOffset" };
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
    // 使用 get_ip 模块获取公网IP
    const clientIP = await getIP({ ipv4: true });
    console.log("获取到的公网IP:", clientIP);
    
    // 调用 ipinfo.io API
    const response = await fetch(`https://ipinfo.io/widget/demo/${clientIP}`);
    const data = await response.json();
    console.log(data);
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