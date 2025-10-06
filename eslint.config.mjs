// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "prettier"],
    rules: {
      semi: ["error"],
      quotes: ["error", "double"],
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
          ignoreRestSiblings: false,
          ignoreUsingDeclarations: false,
          reportUsedIgnorePattern: false,
        },
      ],
    },
  }),
];

export default eslintConfig;
