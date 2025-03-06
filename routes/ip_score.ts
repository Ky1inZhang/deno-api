import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { isValidIP } from "../utils/ip_validator.ts";
import { getClientIP } from "../utils/client_ip.ts";

const router = new Router();

// 正则表达式用于提取评分
const scoreRegex = /<div class="score">Fraud Score: (\d+)<\/div>/;

// 设置路由前缀
router.prefix("/ip-score");

// 处理 IP 评分请求
router.get("/:ip?", async (ctx) => {
  try {
    // 获取 IP 参数，如果没有则使用客户端 IP
    const ip = ctx.params.ip || getClientIP(ctx);
    
    // 验证 IP 地址格式
    if (!ip || !isValidIP(ip)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "无效的 IP 地址格式（支持 IPv4 和 IPv6）" };
      return;
    }

    // 发起请求获取数据
    const response = await fetch(`https://scamalytics.com/ip/${ip}`);
    const html = await response.text();

    // 使用正则表达式提取评分
    const match = html.match(scoreRegex);
    if (match && match[1]) {
      // 设置响应头
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = {
        ip: ip,
        fraud_score: parseInt(match[1], 10)
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { error: "未找到评分信息" };
    }
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "服务器错误" };
  }
});

// 处理路由根路径
router.get("/", (ctx) => {
  ctx.response.body = { message: "请在 URL 中添加要查询的 IP 地址，例如: /ip-score/208.83.237.153，或者直接访问 /ip-score 获取您的 IP 信息" };
});

export { router }; 