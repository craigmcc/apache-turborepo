import { config as baseConfig } from "./base.js";
import globals from "globals";

/**
 * A custom ESLint configuration for applications that use Node.js
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
