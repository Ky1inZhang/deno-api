import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { router as ipScoreRouter } from "./routes/ip_score.ts";
import { router as ipInfoRouter } from "./routes/ip_info.ts";

const app = new Application();

// 处理根路径
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/") {
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.body = {
      message: "API 服务正在运行",
      endpoints: {
        "ip_score": "/ip-score/[ip地址] - 查询 IP 信誉评分",
        "ip_info": "/ipinfo/[ip地址] - 查询 IP 详细信息"
      }
    };
    return;
  }
  await next();
});

// 使用路由
app.use(ipScoreRouter.routes());
app.use(ipScoreRouter.allowedMethods());
app.use(ipInfoRouter.routes());
app.use(ipInfoRouter.allowedMethods());

// 启动服务器
const port = 8000;
console.log(`服务器运行在 http://localhost:${port}`);
await app.listen({ port }); 