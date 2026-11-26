import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    rules: {
      // Apostrophes in copy render correctly; escaping every one hurts readability of the writing.
      "react/no-unescaped-entities": "off",
      // The app is local-first: state is hydrated from localStorage / IndexedDB after mount,
      // which this rule flags. Those effects are intentional, so keep it as a warning.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
