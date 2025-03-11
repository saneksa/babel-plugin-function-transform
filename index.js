module.exports = function ({ types: t }, options) {
  const { fieldName, functionName } = options;

  return {
    name: "babel-plugin-function-transform",
    visitor: {
      Program(path) {
        const body = path.get("body");
        const preambleNodes = [];
        let integrationFound = false;
        let integrationIndex = -1;

        for (let i = 0; i < body.length; i++) {
          const node = body[i].node;
          if (
            t.isExpressionStatement(node) &&
            t.isAssignmentExpression(node.expression) &&
            t.isIdentifier(node.expression.left, { name: fieldName })
          ) {
            integrationFound = true;
            integrationIndex = i;
            break;
          } else {
            preambleNodes.push(node);
          }
        }

        if (!integrationFound) return;

        let preambleInserted = false;

        path.traverse({
          ObjectProperty(p) {
            if (
              t.isIdentifier(p.node.key, { name: functionName }) &&
              (t.isFunctionExpression(p.node.value) ||
                t.isArrowFunctionExpression(p.node.value))
            ) {
              const func = p.node.value;
              if (t.isBlockStatement(func.body)) {
                func.body.body = [...preambleNodes, ...func.body.body];
                preambleInserted = true;
              }
            }
          },
          ObjectMethod(p) {
            if (t.isIdentifier(p.node.key, { name: functionName })) {
              const funcBody = p.node.body;
              if (t.isBlockStatement(funcBody)) {
                funcBody.body = [...preambleNodes, ...funcBody.body];
                preambleInserted = true;
              }
            }
          },
        });

        if (preambleInserted && integrationIndex > 0) {
          path.node.body.splice(0, integrationIndex);
        }
      },
    },
  };
};
