import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { isValidIP } from "../utils/ip_validator.ts";

const router = new Router();

// 设置路由前缀
router.prefix("/ip-vpn");

// 处理 IP VPN 检测请求
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
    const response = await fetch(`https://ipinfo.io/widget/demo/${ip}?dataset=proxy-vpn-detection`);
    
    // 检查响应状态
    if (response.status === 429) {
      ctx.response.status = 429;
      ctx.response.body = { 
        error: "请求频率超限，请稍后再试",
        retry_after: response.headers.get("Retry-After") || "60"
      };
      return;
    }

    if (!response.ok) {
      ctx.response.status = response.status;
      ctx.response.body = { 
        error: `API 请求失败: ${response.statusText}`,
        status: response.status
      };
      return;
    }

    // 尝试解析响应
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (_e) {
        console.error("解析响应失败:", text);
        throw new Error("无效的 JSON 响应");
      }
    }

    // 设置响应头
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = data;
  } catch (error) {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "服务器错误",
      message: error instanceof Error ? error.message : "未知错误"
    };
  }
});

// 处理路由根路径
router.get("/", (ctx) => {
  ctx.response.body = { 
    message: "请在 URL 中添加要查询的 IP 地址，例如: /ip-vpn/104.28.64.54",
    note: "此接口返回 IP 地址的 VPN/代理检测信息"
  };
});

export { router }; 