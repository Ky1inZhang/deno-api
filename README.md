# IP 信息查询服务

基于 Deno 的 IP 地址信息查询服务，支持 IPv4 和 IPv6。

## API 端点

### 1. IP 信誉评分查询
- **端点**: `/ip-score/:ip`
- **方法**: GET
- **示例**: [/ip-score/208.83.237.153](/ip-score/208.83.237.153)
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
- **示例**: [/ip-geo/215.204.222.212](/ip-geo/215.204.222.212)
- **返回**: 地理位置信息，包括国家、城市、经纬度等

### 3. IP VPN/代理检测
- **端点**: `/ip-vpn/:ip`
- **方法**: GET
- **示例**: [/ip-vpn/104.28.64.54](/ip-vpn/104.28.64.54)
- **返回**: VPN 和代理使用检测信息

### 4. IP 地理位置信息（兼容格式）
- **端点**: `/geo/:ip`
- **方法**: GET
- **参数**: 
  - `ip`: IPv4 地址
- **示例**: [/geo/1.1.1.1](/geo/1.1.1.1)
- **成功响应**: 
```json
{
  "time_zone": {
    "name": "Asia/Shanghai",
    "offset_with_dst": 8
  },
  "ip": "1.1.1.1",
  "country_name": "AU",
  "country_code2": "AU",
  "city": "Sydney",
  "longitude": 151.2002,
  "latitude": -33.8591,
  "src": "l",
  "country_flag": "https://ipgeolocation.io/static/flags/au_64.png",
  "languages": "en"
}
```
- **错误响应**:
```json
{
  "error": "错误信息",
  "detail": "详细错误说明（仅在服务器错误时提供）"
}
```
- **状态码**:
  - 200: 成功
  - 400: 请求参数错误（无效IP或缺少IP）
  - 502: 上游服务异常
  - 500: 服务器内部错误

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
│   ├── ip_vpn.ts      # IP VPN检测
│   └── geo.ts         # 兼容格式的地理位置信息
└── utils/             # 工具函数
    └── ip_validator.ts # IP 验证
```

## 使用示例

点击以下链接直接测试：

- [/ip-score/208.83.237.153](/ip-score/208.83.237.153) - 查询 IP 信誉评分
- [/ip-geo/215.204.222.212](/ip-geo/215.204.222.212) - 查询 IP 地理位置
- [/ip-vpn/104.28.64.54](/ip-vpn/104.28.64.54) - 查询 IP VPN/代理信息
- [/geo/1.1.1.1](/geo/1.1.1.1) - 查询兼容格式的 IP 地理位置信息

## 技术栈

- Deno
- TypeScript
- Oak 框架 