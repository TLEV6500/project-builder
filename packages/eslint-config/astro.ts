import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig } from "eslint/config";
import baseConfig from "./base";
import * as astroParser from "astro-eslint-parser";
import tseslint from "typescript-eslint";

export default defineConfig({
    // Seamless inheritance without nesting functions or manual spreading
    extends: [
        baseConfig,
        ...eslintPluginAstro.configs.recommended,
        ...eslintPluginAstro.configs["jsx-a11y-recommended"],
    ],
    // Force framework-specific validation to stay isolated
    files: ["**/*.astro"],
    name: "tlev/astro-config",
    languageOptions: {
        parser: astroParser,
        parserOptions: {
            parser: tseslint.parser,
            extraFileExtensions: [".astro"],
            ecmaVersion: "latest",
            sourceType: "module",
        }
    },
    rules: {
        "astro/no-set-html-directive": "error",
    },
});
