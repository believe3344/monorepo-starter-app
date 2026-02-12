// 使用 .cjs 扩展名，因为 commitlint 需要 CommonJS 格式

/** @type {import('cz-git').UserConfig} */
module.exports = {
  // 继承约定式提交规范
  extends: ['@commitlint/config-conventional'],

  // 校验规则
  rules: {
    // type 枚举（与下面 cz-git 的 types 保持一致）
    'type-enum': [
      2, // 2 = error（不符合则阻止提交）
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 Bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（既不是新功能也不是修复）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建/打包相关
        'ci', // CI/CD 配置
        'chore', // 杂项（依赖更新等）
        'revert', // 回滚
        'types', // 类型定义
        'wip', // 开发中
      ],
    ],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // subject 不限制大小写（中文提交信息需要）
    'subject-case': [0],
    // type 不能为空
    'type-empty': [2, 'never'],
    // header 最大长度 108 字符
    'header-max-length': [2, 'always', 108],
  },

  // cz-git 提示配置（pnpm commit 时的交互界面）
  prompt: {
    alias: {
      fd: 'docs: fix typos',
    },
    // 提交信息步骤
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联 issue 前缀（可选）:',
      customFooterPrefix: '输入自定义 issue 前缀 :',
      footer: '列举关联 issue (可选) 例如: #31, #I3244 :\n',
      generatingByAI: '正在通过 AI 生成你的提交简短描述...',
      generatedSelectByAI: '选择一个 AI 生成的简短描述:',
      confirmCommit: '是否提交或修改 commit ?',
    },

    // type 选项
    types: [
      { value: 'feat', name: 'feat:     ✨ 新增功能', emoji: '✨' },
      { value: 'fix', name: 'fix:      🐛 修复缺陷', emoji: '🐛' },
      { value: 'docs', name: 'docs:     📝 文档变更', emoji: '📝' },
      { value: 'style', name: 'style:    💄 代码格式', emoji: '💄' },
      { value: 'refactor', name: 'refactor: ♻️  代码重构', emoji: '♻️' },
      { value: 'perf', name: 'perf:     ⚡️ 性能优化', emoji: '⚡️' },
      { value: 'test', name: 'test:     ✅ 测试相关', emoji: '✅' },
      { value: 'build', name: 'build:    📦️ 构建相关', emoji: '📦️' },
      { value: 'ci', name: 'ci:       🎡 持续集成', emoji: '🎡' },
      { value: 'chore', name: 'chore:    🔨 其他修改', emoji: '🔨' },
      { value: 'revert', name: 'revert:   ⏪️ 回退代码', emoji: '⏪️' },
      { value: 'types', name: 'types:    🏷️  类型定义', emoji: '🏷️' },
      { value: 'wip', name: 'wip:      🚧 开发中', emoji: '🚧' },
    ],

    // 是否使用 Emoji
    useEmoji: true,

    // Emoji 位置
    emojiAlign: 'center',

    // 定义 scope（对应 monorepo 的各个包）
    scopes: [
      { value: 'web', name: 'web:      用户端' },
      { value: 'admin', name: 'admin:    管理端' },
      { value: 'server', name: 'server:   服务端' },
      { value: 'shared', name: 'shared:   共享包' },
      { value: 'config', name: 'config:   配置相关' },
      { value: 'deps', name: 'deps:     依赖更新' },
      { value: 'other', name: 'other:    其他' },
    ],

    // 是否允许自定义 scope
    allowCustomScopes: true,

    // 空 scope 选项
    allowEmptyScopes: true,

    // 自定义 scope 的位置
    customScopesAlign: 'bottom',

    // Breaking Change 前缀
    breaklineChar: '|',

    // 跳过哪些步骤
    skipQuestions: ['body', 'breaking', 'footerPrefix', 'footer'],

    // subject 字数上限
    subjectLimit: 100,

    // 仅在特定 type 时显示 breaking change
    allowBreakingChanges: ['feat', 'fix'],
  },
};
