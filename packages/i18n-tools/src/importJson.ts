import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists, getJsonFiles, readJsonFile, writeJsonFile } from './utils';

/**
 * 从按语言分类的JSON文件导入i18n翻译到模块文件
 * @param inputDir 输入目录
 * @param modulesDir 模块文件输出目录
 */
export function importFromJsonFiles(inputDir: string, modulesDir: string): void {
  console.log('🚀 Starting i18n import from individual JSON files...');

  // 检查输入目录是否存在
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Error: Input directory not found at ${inputDir}`);
    process.exit(1);
  }

  // 确保模块目录存在
  ensureDirectoryExists(modulesDir);

  const allLangFiles = getJsonFiles(inputDir);

  // 数据重构：将按语言组织的数据，重构为按模块组织
  const restructuredData: Record<string, Record<string, Record<string, string>>> = {};

  allLangFiles.forEach((langFile) => {
    const lang = path.basename(langFile, '.json');
    const filePath = path.join(inputDir, langFile);
    const langContent = readJsonFile(filePath);

    // 遍历该语言文件中的所有扁平化key
    for (const fullKey in langContent) {
      const keyParts = fullKey.split('.');
      if (keyParts.length < 2) {
        console.warn(`⚠️ Skipping invalid key format in ${langFile}: ${fullKey}`);
        continue;
      }

      const moduleName = keyParts[0];
      const key = keyParts.slice(1).join('.');
      const value = langContent[fullKey];

      // 确保模块的根对象存在
      if (!restructuredData[moduleName]) {
        restructuredData[moduleName] = {};
      }
      // 确保该模块下语言的对象存在
      if (!restructuredData[moduleName][lang]) {
        restructuredData[moduleName][lang] = {};
      }

      // 赋值
      restructuredData[moduleName][lang][key] = value;
    }
  });

  // 将重构后的数据写入到模块文件中
  for (const moduleName in restructuredData) {
    const moduleData = restructuredData[moduleName];
    const outputFilePath = path.join(modulesDir, `${moduleName}.json`);

    // 为了让Git diff更清晰，对模块内的语言进行排序
    const sortedModuleData = Object.fromEntries(Object.entries(moduleData).sort());

    writeJsonFile(outputFilePath, sortedModuleData);
    console.log(`✅ Updated module file: ${outputFilePath}`);
  }

  console.log('🎉 Import complete!');
}
