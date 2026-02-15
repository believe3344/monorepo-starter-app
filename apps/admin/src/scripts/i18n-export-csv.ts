import path from 'path';
import { fileURLToPath } from 'url';
import { exportToCsv } from '@app/i18n-tools';

// ESM 中获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const MODULES_DIR = path.join(__dirname, '../src/locales/modules');
const OUTPUT_DIR = path.join(__dirname, '../translations');

// 使用抽离后的工具函数
exportToCsv(MODULES_DIR, OUTPUT_DIR, 'translations.csv');
