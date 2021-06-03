Repository for https://marketplace.visualstudio.com/items?itemName=contrix09.install-flutter-sdk

**To create VSIX package:**

Set current working directory to `src` and run

```sh
tsc --p install
tfx extension create --manifest-globs vss-extension.json
```