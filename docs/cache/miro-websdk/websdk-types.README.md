# Miro WebSDK v2 typings file

Provides typing for the Miro WebSDK v2.

## Usage

### Install the package

Using `npm`

```
npm install @mirohq/websdk-types
```

Using `yarn`

```
yarn add @mirohq/websdk-types
```

Using `pnpm`

```
pnpm add @mirohq/websdk-types
```

### If you are working on a `TypeScript` project

Include the types file inside your [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
file like this:

```diff
{
  "compilerOptions": {
+   "typeRoots": [
+     "./node_modules/@types",
+     "./node_modules/@mirohq"
+   ]
  }
}
```

### If you are working on a `JavaScript` project

> This step does not add types to your project, but it improves your autocompletion experience. This typically works
> with all modern editors & IDEs. If you encounter an issue, check the documentation for your editor.

1. Create the [`jsconfig.json`](https://code.visualstudio.com/docs/languages/jsconfig) file at the root of your project.

2. Add the following

```json
{
    "compilerOptions": {
        "typeRoots": ["./node_modules/@types", "./node_modules/@mirohq"]
    }
}
```

3. You should be able to get autocompletion working inside your JavaScript project.
