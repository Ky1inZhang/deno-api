# IP 信息查询服务

基于 Deno 的 IP 地址信息查询服务，支持 IPv4 和 IPv6。

## API 端点

### 1. IP 信誉评分查询
- **端点**: `/ip-score/:ip`
- **方法**: GET
- **示例**: `/ip-score/208.83.237.153`
- **返回**: 
```json
{
  "ip": "208.83.237.153",
  "fraud_score": 56
}
```

### 2. IP 详细信息查询
- **端点**: `/ipinfo/:ip`
- **方法**: GET
- **示例**: `/ipinfo/208.83.237.152`
- **返回**: 完整的 IP 信息，包括地理位置、ISP、公司信息等

## 快速开始

1. 安装 Deno
2. 运行服务：`deno task dev`
3. 访问：`http://localhost:8000`

## 项目结构

```
.
├── main.ts              # 入口文件
├── routes/             # API 路由
│   ├── ip_score.ts    # IP 评分
│   └── ip_info.ts     # IP 信息
└── utils/             # 工具函数
    └── ip_validator.ts # IP 验证
```

## 技术栈

- Deno
- TypeScript
- Oak 框架 