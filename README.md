```js
// babel.config.js

module.exports = {
  sourceType: "unambiguous",
  plugins: [
    "@saneksa/babel-plugin-function-transform",
    {
      fieldName: "intity",
      functionName: "execute",
    },
  ],
};
```
