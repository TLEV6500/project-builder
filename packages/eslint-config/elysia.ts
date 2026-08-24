import { defineConfig } from "eslint/config";
import baseConfig from "./base.js";

export default defineConfig({ // Pulls in the base config with Bun globals built-in
    extends: [
       baseConfig
    ],
    files: ["**/*.ts"],
    name: "tlev/elysia-config",
        rules: {
            // Allows flexible typing for complex Elysia schemas/contexts
            "@typescript-eslint/no-explicit-any": "warn",

            // Standardizes underscore prefixing for unused route parameters (e.g., _set, _derive)
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        }
});
