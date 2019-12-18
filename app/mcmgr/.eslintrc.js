module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    // 'prettier',
    // 'plugin:@typescript-eslint/recommended',
    // 'prettier/@typescript-eslint',
    // 'plugin:prettier/recommended',
    // 'plugin:vue/recommended',
    // '@vue/prettier',
    // '@vue/typescript'
    '@vue/typescript',
    'plugin:vue/essential',
    // 'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
};
