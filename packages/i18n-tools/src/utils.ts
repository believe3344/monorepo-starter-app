import fs from 'fs';

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 获取指定目录下所有JSON文件
 * @param dirPath 目录路径
 * @returns JSON文件列表
 */
export function getJsonFiles(dirPath: string): string[] {
  return fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'));
}

/**
 * 读取JSON文件内容
 * @param filePath 文件路径
 * @returns 解析后的JSON对象
 */
export function readJsonFile(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * 写入JSON文件
 * @param filePath 文件路径
 * @param data 要写入的数据
 * @param pretty 是否美化输出
 */
export function writeJsonFile(filePath: string, data: any, pretty: boolean = true): void {
  fs.writeFileSync(filePath, pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}
