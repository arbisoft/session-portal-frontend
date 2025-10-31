import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    ignores: [".next/", "node_modules/", "dist/", "build/", "coverage/", "public/", "next-env.d.ts"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      prettier: prettierPlugin,
      "@next/next": nextPlugin,
    },

    settings: {
      react: { version: "detect" },
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        typescript: { project: "./tsconfig.json", alwaysTryTypes: true },
      },
    },

    rules: {
      // === General Code Style ===
      quotes: ["error", "double"],
      eqeqeq: "error",
      "array-callback-return": "error",
      "no-alert": "error",
      "no-return-assign": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "max-len": ["error", { code: 130 }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-nested-ternary": "warn",
      "no-shadow": "error",
      "eol-last": ["error", "always"],

      // === TypeScript Rules ===
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],

      // === Import Rules ===
      "import/no-unresolved": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
          css: "never",
        },
      ],
      "import/prefer-default-export": "off",
      "import/named": "off",
      "import/no-named-as-default": "off",

      // === Next.js ===
      "@next/next/no-img-element": "off",

      // === Misc ===
      "prefer-destructuring": ["error", { array: false, object: true }, { enforceForRenamedProperties: false }],
      "no-empty-function": "off",

      // === React Hook Form performance ===
      /* eslint-disable max-len */
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name=watch], MemberExpression[object.name=methods][property.name=watch]",
          message: "watch re-render the whole form component. Use hook useWatch instead.",
        },
        {
          selector: "VariableDeclarator > ObjectPattern > Property[key.name=formState]",
          message: "formState re-render the whole form component. Use hook useFormState instead.",
        },
        {
          selector: "VariableDeclarator[init.callee.name=useFormState][id.type=Identifier]",
          message:
            "Use destructuring assignment for useFormState. Example: const { isDirty } = useFormState(). Returned formState is wrapped with Proxy to improve render performance and skip extra computation if specific state is not subscribed, so make sure you deconstruct or read it before render in order to enable the subscription. More info here https://react-hook-form.com/docs/useformstate#rules",
        },
        {
          selector: "MemberExpression[object.name=control]",
          message:
            "Do not access any of the properties inside this object directly. It's for internal usage only. More info here: https://react-hook-form.com/docs/useform/control",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useForm] ~ VariableDeclaration[declarations.0.init.callee.name=useWatch]",
          message:
            "useWatch in main form component (which use useForm) will re-render the whole form component. Move your useWatch's logic to separate component.",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useForm] ~ VariableDeclaration[declarations.0.init.callee.name=useFieldArray]",
          message:
            "useFieldArray in main form component (which use useForm) will re-render the whole form component. Move your useFieldArray's logic to separate component.",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useForm] ~ VariableDeclaration[declarations.0.init.callee.name=useController]",
          message:
            "useController in main form component (which use useForm) will re-render the whole form component. Move your useController's logic to separate component.",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useForm] ~ VariableDeclaration[declarations.0.init.callee.name=useFormContext]",
          message:
            "useFormContext in main form component (which use useForm) will re-render the whole form component. Move your useFormContext's logic to separate component.",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useForm] ~ VariableDeclaration[declarations.0.init.callee.name=useFormState]",
          message:
            "useFormState in main form component (which use useForm) will re-render the whole form component. Move your useFormState's logic to separate component.",
        },
        {
          selector:
            "CallExpression[callee.name=useForm][arguments.length=0], CallExpression[callee.name=useForm][arguments.length=1]:not(:has(Property[key.name=defaultValues]))",
          message:
            "Pass object with defaultValues for correct formState behavior. More info here: https://react-hook-form.com/api/useform/formstate#main",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useState] ~ ReturnStatement JSXIdentifier[name=Controller]",
          message:
            "Don't use Controller with useState. Move you useState and another logic to separate component and wrap this component via Controller. Reason: This approach will rise wrong logic for handle input field. Example: src/components/form/text-input/form-text-input.tsx",
        },
        {
          selector:
            "VariableDeclaration[declarations.0.init.callee.name=useState] ~ VariableDeclaration[declarations.0.init.callee.name=useController], VariableDeclaration[declarations.0.init.callee.name=useController] ~ VariableDeclaration[declarations.0.init.callee.name=useState]",
          message:
            "Don't use useController with useState. Move you useState and another logic to separate component and wrap this component into another component with useController. Reason: This approach will rise wrong logic for handle input filed",
        },
        {
          selector:
            "CallExpression[callee.name=useForm][arguments.length=1] Property[key.name=defaultValues][value.properties.length=0]",
          message:
            "defaultValues can not be empty object for correct formState behavior. More info here: https://react-hook-form.com/api/useform/formstate#main",
        },
        {
          selector: "MemberExpression[object.name=React][property.name=/^use/]",
          message:
            "Use hooks without React prefix. For avoid using both import styles. Example: useEffect instead of React.useEffect.",
        },
        {
          selector: "CallExpression[callee.type=MemberExpression][callee.property.name=forEach]:has(AwaitExpression)",
          message:
            "Do not use in forEach async code, because logic will not be awaited. use map with Promise.all, for example await Promise.all(ARRAY_OF_ITEM.map(...)) or use regular for loop.",
        },
        {
          selector:
            "ConditionalExpression[consequent.type=Literal][consequent.value=true][alternate.type=Literal][alternate.value=false]",
          message: "Do not use condition ? true : false. Simplify someVariable === 42 ? true : false  to someVariable === 42",
        },
        {
          selector: "JSXElement[openingElement.name.property.name=Provider] JSXElement[openingElement.name.name]",
          message:
            "Do not put your regular components inside Context .Provider. Create new component, for example ComponentProvider. Put Provider's logic to ComponentProvider. Render {children} instead of regular component. Wrap regular component via new ComponentProvider. Example: src/services/auth/auth-provider",
        },
        {
          selector:
            "Property[key.name=/^(padding|margin|paddingLeft|paddingRight|paddingTop|paddingBottom|paddingVertical|marginLeft|marginRight|marginTop|marginBottom|marginVertical)$/][value.type=/^(Literal|UnaryExpression)$/]:not([value.value='0 !important']):not([value.value='0']):not([value.value='0 auto']):not([value.value='auto'])",
          message: "Use theme.spacing() instead of literal.",
        },
        {
          selector:
            "CallExpression[callee.name=/^(useQuery|useInfiniteQuery)$/] Property[key.name=queryKey]:not(:has(Identifier[name=key]))",
          message: "Use key created via createQueryKeys function instead of your solution",
        },
        {
          selector: "CallExpression[callee.name=refresh]",
          message:
            "Do not use refresh() function for update or change result in react-query. Use queryClient.resetQueries or pass new filter data to queryKey.",
        },
        {
          selector:
            "ExpressionStatement[expression.callee.object.name=JSON][expression.callee.property.name=parse][expression.arguments.0.callee.object.name=JSON][expression.arguments.0.callee.property.name=stringify]",
          message: "Do not use JSON.parse(JSON.stringify(...)) for deep copy. Use structuredClone instead.",
        },
        {
          selector: "CallExpression[callee.name=test][arguments.0.value!=/^should/]",
          message: "test should start with should",
        },
      ],
      /* eslint-enable max-len */
      // === MUI Imports ===
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mui/material",
              message: "Please use \"import ComponentName from '@mui/material/ComponentName'\" instead.",
            },
            {
              name: "@mui/icons-material",
              message: "Please use \"import IconName from '@mui/icons-material/IconName'\" instead.",
            },
          ],
        },
      ],

      // === Prettier ===
      "prettier/prettier": [
        "error",
        {
          printWidth: 130,
          singleQuote: false,
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
