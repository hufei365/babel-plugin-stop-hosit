const fs = require('fs');
const path = require('path');

const types = require('@babel/types');
// api doc: https://babeljs.io/docs/en/next/babel-types

let requires = [];

const collectRequire = {
	CallExpression: {
		enter(path) {
			if (path.get('callee').node.name === 'require') {
				console.log(path.get('arguments')[0].node.value);
				requires.push(path);
			}
		}
	}
};

module.exports = function({ types: t }) {
	return {
		visitor: {
			Program: {
				enter(path, state) {
					ra = null;
					requires = [];
				},
				exit(path, state) {
					writeFile(generateFile('before')(), JSON.stringify(state.file.ast))
						.then((d) => {
							console.log(`write file's ast : ${state.filename} success\n`);
						})
						.finally(() => {
							console.log(`[${new Date()}] write before ast error~`);
						});
					path.traverse(collectRequire);

					if (requires.length === 0) {
						return false;
					}

					let hasRA = path.get('body').some((n) => {
						if (
							n.type === 'ExpressionStatement' &&
							n.node.expression.type === 'CallExpression' &&
							n.node.expression.callee &&
							n.node.expression.callee.type === 'MemberExpression' &&
							n.node.expression.callee.object.name === 'require' &&
							n.node.expression.callee.property.name === 'async'
						) {
							ra = n;
							return true;
						}
					});

					if (hasRA) {
						let n = ra;
						let raArgs = [],
							raCallback = null;
						if (ra.node.expression.arguments[0].type === 'ArrayExpression') {
							raArgs = ra.node.expression.arguments[0];
							raCallback = ra.node.expression.arguments[1];
						}

						requires.reverse().forEach((n, i) => {
							let args = n.get('arguments');
							args && raArgs.elements.unshift(args[0].node);

							const varObj = path.scope.generateUidIdentifier('_require');

							raCallback.params.unshift(varObj);

							n.replaceWith(varObj);
						});

						const allPrevs = ra.getAllPrevSiblings();
						allPrevs.reverse().forEach((n) => {
							raCallback.body.body.unshift(n.node);
							n.remove();
						});
					} else {
						const newRa = t.expressionStatement(
							t.callExpression(t.memberExpression(t.identifier('require'), t.identifier('async')), [
								t.arrayExpression([]),
								t.functionExpression(null, [], t.blockStatement([]))
							])
						);

						path.node.body = [newRa];

						
					}

					// create a new require.async(['x',...], function(x,...){});

					writeFile(generateFile('after')(), JSON.stringify(state.file.ast))
						.then((d) => {
							console.log(`write file's ast : ${state.filename} success\n`);
						})
						.finally(() => {
							console.log(`[${new Date()}] write after ast error~`);
						});
				}
			}
		}
	};
};

// const raObj = {
// 	type: 'ExpressionStatement',
// 	expression: {
// 		type: 'CallExpression'
// 	},
// 	callee: {
// 		type: 'MemberExpression',
// 		object: {
// 			type: 'Identifier',
// 			name: 'require'
// 		},
// 		property: {
// 			type: 'Identifier',
// 			name: 'async'
// 		},
// 		computed: false
// 	},
// 	arguments: [
// 		{
// 			type: 'ArrayExpression',
// 			elements: []
// 		},
// 		{
// 			type: 'FunctionExpression',
// 			id: null,
// 			generator: false,
// 			async: false,
// 			params: [],
// 			body: {
// 				type: 'BlockStatement',
// 				body: [],
// 				directives: []
// 			}
// 		}
// 	]
// };

function writeFile(file, content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, content, (err, result) => {
			if (err) {
				reject(false);
			} else {
				resolve(true);
			}
		});
	});
}

function generateFile(pos) {
	return function() {
		const cur = new Date();
		return '' + pos + '-' + timeFormat('HH-mm-ss', cur) + '.json';
	};
}

function timeFormat(format, t) {
	format = String(format);
	t = t || new Date();
	return format.replace(/HH?/, t.getHours()).replace(/mm?/, t.getMinutes()).replace(/ss?/, t.getSeconds());
}
