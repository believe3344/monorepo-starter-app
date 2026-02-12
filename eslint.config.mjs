import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // ===========================
  // 1. 全局忽略
  // ===========================
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/prisma/**",
      "**/*.config.{js,mjs,cjs,ts}", // 配置文件不检查
    ],
  },

  // ===========================
  // 2. 基础规则（所有 JS/TS 文件）
  // ===========================
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ===========================
  // 3. 全局自定义规则
  // ===========================
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier 作为 ESLint 规则
      "prettier/prettier": "warn",

      // TypeScript 规则调整
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // 忽略 _ 开头的参数
          varsIgnorePattern: "^_", // 忽略 _ 开头的变量
          ignoreRestSiblings: true, // 解构时忽略剩余属性
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // any 类型警告而非报错
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }], // 允许 console.warn/error
    },
  },

  // ===========================
  // 4. React 应用专属规则（web + admin）
  // ===========================
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "apps/admin/src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser, // window, document, fetch 等
      },
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,

      // React Refresh（HMR）规则
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // ===========================
  // 5. NestJS 服务端专属规则
  // ===========================
  {
    files: ["apps/server/src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node, // process, __dirname, Buffer 等
      },
    },
    rules: {
      // NestJS 大量用到装饰器和 any，放宽限制
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",

      // NestJS 的依赖注入 constructor 参数经常"未使用"
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // 允许 require()（NestJS 动态模块加载偶尔需要）
      "@typescript-eslint/no-require-imports": "off",

      // 服务端允许 console.log（用于日志）
      "no-console": "off",
    },
  },

  // ===========================
  // 6. 共享包规则
  // ===========================
  {
    files: ["packages/*/src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },

  // ===========================
  // 7. Prettier 冲突解决（必须放最后！）
  // ===========================
  prettierConfig,
);
