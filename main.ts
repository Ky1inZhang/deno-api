import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { router as ipScoreRouter } from "./routes/ip_score.ts";
import { router as ipGeoRouter } from "./routes/ip_geo.ts";
import { router as ipVpnRouter } from "./routes/ip_vpn.ts";
import { Marked } from "marked";

const app = new Application();
const marked = new Marked();

// 处理根路径
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/") {
    try {
      // 读取 README.md 文件
      const readme = await Deno.readTextFile("README.md");
      // 转换为 HTML
      const html = marked.parse(readme);
      
      // 添加基本样式
      const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>IP 信息查询服务</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
              background-color: #ffffff;
            }
            .markdown-body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 800px;
              margin: 0 auto;
              padding: 45px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            @media (max-width: 767px) {
              .markdown-body {
                padding: 15px;
              }
            }
            pre {
              background: #f6f8fa;
              padding: 16px;
              border-radius: 6px;
              overflow-x: auto;
            }
            code {
              background: #f6f8fa;
              padding: 2px 4px;
              border-radius: 3px;
            }
            a {
              color: #0366d6;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            h1, h2, h3 {
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: 600;
              line-height: 1.25;
            }
          </style>
        </head>
        <body>
          <div class="markdown-body">
            ${html}
          </div>
        </body>
        </html>
      `;

      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = styledHtml;
      return;
    } catch (error) {
      console.error("Error reading README:", error);
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = {
        message: "API 服务正在运行",
        endpoints: {
          "ip-score": "/ip-score/[ip地址] - 查询 IP 信誉评分",
          "ip-geo": "/ip-geo/[ip地址] - 查询 IP 地理位置信息",
          "ip-vpn": "/ip-vpn/[ip地址] - 查询 IP 的 VPN/代理检测信息"
        }
      };
    }
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
      "ip-score": "/ip-score/[ip地址]",
      "ip-geo": "/ip-geo/[ip地址]",
      "ip-vpn": "/ip-vpn/[ip地址]"
    }
  };
});

// 统一的请求处理函数
async function handler(request: Request): Promise<Response> {
  return await app.handle(request) || new Response("Not Found", { status: 404 });
}

// 启动服务器
const port = 8000;
Deno.serve({ port }, handler);