import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { ensureDirectoryExists, getJsonFiles, readJsonFile } from './utils';

/**
 * 将i18n模块导出为CSV文件
 * @param modulesDir 模块文件所在目录
 * @param outputDir 输出目录
 * @param outputFileName 输出文件名
 */
export function exportToCsv(
  modulesDir: string,
  outputDir: string,
  outputFileName: string = 'translations.csv',
): void {
  console.log('🚀 Starting i18n export...');

  ensureDirectoryExists(outputDir);

  const allModules = getJsonFiles(modulesDir);
  const translationsMap: Record<string, Record<string, string>> = {};
  const allLangs = new Set<string>();

  allModules.forEach((moduleFile) => {
    const moduleName = path.basename(moduleFile, '.json');
    const filePath = path.join(modulesDir, moduleFile);
    const content = readJsonFile(filePath);

    for (const lang in content) {
      allLangs.add(lang);
      const translations = content[lang];
      for (const key in translations) {
        const fullKey = `${moduleName}.${key}`;
        if (!translationsMap[fullKey]) {
          translationsMap[fullKey] = {};
        }
        translationsMap[fullKey][lang] = translations[key];
      }
    }
  });

  const sortedLangs = Array.from(allLangs).sort();
  const headers = ['key', ...sortedLangs];

  const csvData: string[][] = [headers];

  const sortedKeys = Object.keys(translationsMap).sort();
  sortedKeys.forEach((fullKey) => {
    const row = [fullKey];
    sortedLangs.forEach((lang) => {
      const value = translationsMap[fullKey][lang] || '';
      row.push(value);
    });
    csvData.push(row);
  });

  const csvContent = Papa.unparse(csvData);
  const csvOutputPath = path.join(outputDir, outputFileName);
  fs.writeFileSync(csvOutputPath, csvContent);

  console.log(`✅ Export complete! File saved to: ${csvOutputPath}`);
}
