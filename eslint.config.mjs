import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Рабочие копии репозитория, созданные агентами: не часть сборки.
    ".claude/**",
  ]),
]);

// jest.mock() поднимается выше импортов, поэтому внутри фабрик и в конфиге
// Jest требуется CommonJS require() — ESM-импорт там работать не будет.
eslintConfig.push({
  files: ["jest.config.js", "**/*.test.ts", "**/*.test.tsx"],
  rules: { "@typescript-eslint/no-require-imports": "off" },
});

export default eslintConfig;
