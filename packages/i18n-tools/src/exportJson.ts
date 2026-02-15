import path from 'path';
import { ensureDirectoryExists, getJsonFiles, readJsonFile, writeJsonFile } from './utils';

/**
 * 将i18n模块导出为按语言分类的JSON文件
 * @param modulesDir 模块文件所在目录
 * @param outputDir 输出目录
 */
export function exportToJsonFiles(modulesDir: string, outputDir: string): void {
  console.log('🚀 Starting i18n export to individual JSON files...');

  ensureDirectoryExists(outputDir);

  const allModuleFiles = getJsonFiles(modulesDir);

  // 数据重构：将数据按语言聚合
  const translationsByLang: Record<string, Record<string, string>> = {};

  allModuleFiles.forEach((moduleFile) => {
    const moduleName = path.basename(moduleFile, '.json');
    const filePath = path.join(modulesDir, moduleFile);
    const moduleContent = readJsonFile(filePath);

    // 遍历模块文件中的每种语言
    for (const lang in moduleContent) {
      // 确保该语言的根对象存在
      if (!translationsByLang[lang]) {
        translationsByLang[lang] = {};
      }

      const translations = moduleContent[lang];
      // 遍历该语言下的所有键值对
      for (const key in translations) {
        const fullKey = `${moduleName}.${key}`;
        translationsByLang[lang][fullKey] = translations[key];
      }
    }
  });

  // 为每种语言写入一个独立的JSON文件
  for (const lang in translationsByLang) {
    const langData = translationsByLang[lang];
    const outputFilePath = path.join(outputDir, `${lang}.json`);

    // 为了可读性，对key进行排序
    const sortedLangData = Object.fromEntries(Object.entries(langData).sort());

    writeJsonFile(outputFilePath, sortedLangData);
    console.log(`✅ Exported language file: ${outputFilePath}`);
  }

  console.log('🎉 Export complete!');
}
