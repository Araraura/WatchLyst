module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:node/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "node"],
  root: true,
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "array-callback-return": "error",
    "arrow-spacing": ["warn", { "before": true, "after": true }],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": "error",
    "comma-style": "error",
    "curly": ["error", "multi-line", "consistent"],
    "dot-location": ["error", "property"],
    "eol-last": ["error", "always"],
    "indent": ["error", 2],
    "keyword-spacing": "error",
    "max-nested-callbacks": ["error", { "max": 3 }],
    "max-statements-per-line": ["error", { "max": 2 }],
    "no-console": "off",
    "no-constant-binary-expression": "error",
    "no-constructor-return": "error",
    "no-duplicate-imports": "error",
    "no-else-return": "error",
    "no-empty-function": "error",
    "no-floating-decimal": "error",
    "no-lonely-if": "error",
    "no-magic-numbers": "error",
    "no-mixed-operators": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],
    "no-new-native-nonconstructor": "error",
    "no-unneeded-ternary": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "no-self-compare": "error",
    "no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
    "no-template-curly-in-string": "error",
    "no-trailing-spaces": ["error"],
    "no-unmodified-loop-condition": "warn",
    "no-unreachable-loop": "warn",
    "no-var": "error",
    "object-curly-spacing": ["error", "always"],
    "prefer-const": "error",
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always",
    }],
    "space-in-parens": "error",
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": "error",
    "yoda": "error",
    "node/handle-callback-err": "off",
    "node/no-missing-import": "off",
    "node/no-sync": "error",
    "node/prefer-promises/fs": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
