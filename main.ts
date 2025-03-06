import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { router as ipScoreRouter } from "./routes/ip_score.ts";
import { router as ipGeoRouter } from "./routes/ip_geo.ts";
import { router as ipVpnRouter } from "./routes/ip_vpn.ts";

const app = new Application();

// 处理根路径
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/") {
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = {
      message: "API 服务正在运行",
      endpoints: {
        "ip_score": "/ip-score/[ip地址] - 查询 IP 信誉评分",
        "ip_geo": "/ip-geo/[ip地址] - 查询 IP 地理位置信息",
        "ip_vpn": "/ip-vpn/[ip地址] - 查询 IP 的 VPN/代理检测信息"
      }
    };
    return;
  }
  await next();
});

// 使用路由
app.use(ipScoreRouter.routes());
app.use(ipScoreRouter.allowedMethods());
app.use(ipGeoRouter.routes());
app.use(ipGeoRouter.allowedMethods());
app.use(ipVpnRouter.routes());
app.use(ipVpnRouter.allowedMethods());

// 处理 404
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.headers.set("Content-Type", "application/json");
  ctx.response.body = {
    error: "Not Found",
    message: `路径 '${ctx.request.url.pathname}' 不存在`,
    available_endpoints: {
      "ip_score": "/ip-score/[ip地址]",
      "ip_geo": "/ip-geo/[ip地址]",
      "ip_vpn": "/ip-vpn/[ip地址]"
    }
  };
});

// 统一的请求处理函数
async function handler(request: Request): Promise<Response> {
  return await app.handle(request) || new Response("Not Found", { status: 404 });
}

// 根据环境选择服务器启动方式
if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
  // Deno Deploy 环境
  Deno.serve(handler);
} else {
  // 本地开发环境
  const port = 8000;
  console.log(`服务器运行在 http://localhost:${port}`);
  await app.listen({ port });
}