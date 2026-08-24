import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig({
    // 'extends' automatically flattens arrays cleanly behind the scenes!
    extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended, // Kept as spread because tseslint configs are arrays
    ],
    name: "tlev/base-config",
    plugins: {
        turbo: turboPlugin
    },
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
            ...globals.node,
            ...globals.browser,
        },
    },
    rules: {
        "turbo/no-undeclared-env-vars": "warn",
        "indent": "off",
        "quotes": "off",
        "semi": "off",
    },
});
