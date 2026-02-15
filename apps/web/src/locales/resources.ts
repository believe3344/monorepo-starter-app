import { languages } from './lang-lists';

// 使用 import.meta.glob 动态导入所有语言模块
const modules = import.meta.glob('./modules/*.json', { eager: true });

// 定义语言聚合
const resources: Record<string, Record<string, any>> = {};
languages.forEach((item) => {
  resources[item.value] = {};
});

const namespaces: string[] = [];
for (const path in modules) {
  // 从路径中提取模块名 (e.g., './modules/home.json' -> 'home')
  const moduleName = path.match(/.\/modules\/(\w+)\.json$/)?.[1];
  if (moduleName) {
    if (!namespaces.includes(moduleName)) {
      namespaces.push(moduleName);
    }
    const moduleContent = (modules[path] as any).default || modules[path];
    if (moduleContent) {
      // Iterate over the languages present in the JSON file (e.g., "zh-CN", "en")
      for (const lang in moduleContent) {
        if (Object.prototype.hasOwnProperty.call(moduleContent, lang) && resources[lang]) {
          // Assign the translations to the correct namespace for that language
          resources[lang][moduleName] = moduleContent[lang];
        }
      }
    }
  }
}

export { namespaces, resources };

export type Resources = (typeof resources)['en'];
