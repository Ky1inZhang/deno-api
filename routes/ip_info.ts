import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { isValidIP } from "../utils/ip_validator.ts";

const router = new Router();

// 设置路由前缀
router.prefix("/ipinfo");

// 处理 IP 信息请求
router.get("/:ip", async (ctx) => {
  try {
    const ip = ctx.params.ip;
    
    // 验证 IP 地址格式
    if (!ip || !isValidIP(ip)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "无效的 IP 地址格式（支持 IPv4 和 IPv6）" };
      return;
    }

    // 发起请求获取数据
    const response = await fetch(`https://ipinfo.io/widget/demo/${ip}`);
    const data = await response.json();

    // 设置响应头
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = data;
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "服务器错误" };
  }
});

// 处理路由根路径
router.get("/", (ctx) => {
  ctx.response.body = { message: "请在 URL 中添加要查询的 IP 地址，例如: /ipinfo/208.83.237.152" };
});

export { router }; 