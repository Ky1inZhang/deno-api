/**
 * 验证 IP 地址格式（支持 IPv4 和 IPv6）
 * @param ip IP 地址字符串
 * @returns boolean 是否是有效的 IP 地址
 */
export function isValidIP(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  
  // IPv4 验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 验证（支持压缩格式）
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
} 