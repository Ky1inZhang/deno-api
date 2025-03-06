/**
 * 验证 IP 地址格式（支持 IPv4 和 IPv6）
 * @param ip IP 地址字符串
 * @returns boolean 是否是有效的 IP 地址
 */
export function isValidIP(ip: string): boolean {
  console.log("=== 开始验证 IP 地址 ===");
  console.log("待验证的 IP:", ip);

  if (!ip || ip === "unknown") {
    console.log("IP 地址为空或 unknown");
    return false;
  }

  // IPv4 验证
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 验证（支持压缩格式）
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
  
  const isIPv4 = ipv4Regex.test(ip);
  const isIPv6 = ipv6Regex.test(ip);

  console.log("验证结果:", {
    isIPv4: isIPv4,
    isIPv6: isIPv6,
    isValid: isIPv4 || isIPv6
  });

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
} 