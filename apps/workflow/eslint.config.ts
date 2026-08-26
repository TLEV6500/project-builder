import { globalIgnores } from "eslint/config";
import baseConfig from "@tlev/eslint/base";

export default [
    globalIgnores(["dist/**", ".turbo/**", "node_modules/**"]),
    ...baseConfig
];
