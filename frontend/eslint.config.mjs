import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  {
    ignores: [".next/**", "node_modules/**", "*.config.js", "*.config.mjs", "postcss.config.js"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
];