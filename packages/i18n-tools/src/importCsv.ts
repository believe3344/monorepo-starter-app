import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { ensureDirectoryExists, writeJsonFile } from './utils';

/**
 * 从CSV文件导入i18n翻译到模块文件
 * @param csvInputPath CSV文件路径
 * @param modulesDir 模块文件输出目录
 */
export function importFromCsv(csvInputPath: string, modulesDir: string): void {
  console.log('🚀 Starting i18n import from CSV...');

  // 检查CSV文件是否存在
  if (!fs.existsSync(csvInputPath)) {
    console.error(`❌ Error: Input file not found at ${csvInputPath}`);
    process.exit(1);
  }

  // 确保模块目录存在
  ensureDirectoryExists(modulesDir);

  // 读取并解析CSV文件
  const csvContent = fs.readFileSync(csvInputPath, 'utf8');
  const parsedCsv = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  // 将扁平化的CSV数据重构成模块化的目标结构
  const restructuredData: Record<string, any> = {};

  parsedCsv.data.forEach((row: any) => {
    const fullKey = row.key;
    if (!fullKey) return;

    const keyParts = fullKey.split('.');
    if (keyParts.length < 2) {
      console.warn(`⚠️ Skipping invalid key format (must be module.key): ${fullKey}`);
      return;
    }

    const moduleName = keyParts[0];
    const key = keyParts.slice(1).join('.');

    // 为这个模块初始化
    if (!restructuredData[moduleName]) {
      restructuredData[moduleName] = {};
    }

    // 遍历该行的所有语言
    for (const lang in row) {
      if (lang !== 'key') {
        // 为该语言初始化
        if (!restructuredData[moduleName][lang]) {
          restructuredData[moduleName][lang] = {};
        }
        restructuredData[moduleName][lang][key] = row[lang];
      }
    }
  });

  // 将重构后的数据写回模块文件
  for (const moduleName in restructuredData) {
    const moduleData = restructuredData[moduleName];
    const outputFilePath = path.join(modulesDir, `${moduleName}.json`);
    writeJsonFile(outputFilePath, moduleData);
    console.log(`✅ Updated file: ${outputFilePath}`);
  }

  console.log('🎉 Import complete!');
}
