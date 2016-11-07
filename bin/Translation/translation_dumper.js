/**
 * Extract translation information from a JS file.
 *
 * Usage: pass the path of a JS file as a parameter.
 *
 * The script will output JSON containing the translation information on the standard output.
 * Example of output:
 * `{"translationsFound":[{"key":"mykey","domain":"mydomain"}]}`
 *
 */

var walk = require('estree-walker').walk,
    acorn = require('acorn'),
    fs = require('fs'),

    isCallExpression = function (node) {
        return node.type && node.type == 'CallExpression';
    },

    isTransFunction = function (node) {
        return node.callee && node.callee.property && node.callee.property.name == 'trans';
    },

    isY = function (node) {
        return node.callee.object && node.callee.object.object && node.callee.object.object.name === "Y";
    },

    isEz = function (node) {
        return node.callee.object.property && node.callee.object.property.name === "eZ";
    },

    // Only values are supported yet (not variables)
    hasValues = function (node) {
        return node.arguments[0].value;
    },

    sourceCode = fs.readFileSync(process.argv[2]),
    ast = acorn.parse(sourceCode, {}),
    result = {translationsFound: []};

walk(ast, {
    enter: function (node, parent) {
        if(isCallExpression(node) && isTransFunction(node) && isY(node) && isEz(node) && hasValues(node)) {
            result.translationsFound.push({
                key: node.arguments[0].value,
                domain: node.arguments[2].value,
            });
        }
    },
});

console.log(JSON.stringify(result));
