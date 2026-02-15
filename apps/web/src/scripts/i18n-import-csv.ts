import path from 'path';
import { fileURLToPath } from 'url';
import { importFromCsv } from '@app/i18n-tools';

// ESM 中获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const MODULES_DIR = path.join(__dirname, '../src/locales/modules');
const INPUT_DIR = path.join(__dirname, '../translations');
const CSV_INPUT_PATH = path.join(INPUT_DIR, 'translations.csv');

// 使用抽离后的工具函数
importFromCsv(CSV_INPUT_PATH, MODULES_DIR);
