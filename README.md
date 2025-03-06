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

### 2. IP 地理位置查询
- **端点**: `/ip-geo/:ip`
- **方法**: GET
- **示例**: `/ip-geo/215.204.222.212`
- **返回**: 地理位置信息，包括国家、城市、经纬度等

### 3. IP VPN/代理检测
- **端点**: `/ip-vpn/:ip`
- **方法**: GET
- **示例**: `/ip-vpn/104.28.64.54`
- **返回**: VPN 和代理使用检测信息

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
│   ├── ip_geo.ts      # IP 地理位置
│   └── ip_vpn.ts      # IP VPN检测
└── utils/             # 工具函数
    └── ip_validator.ts # IP 验证
```

## 技术栈

- Deno
- TypeScript
- Oak 框架 