const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const types = require('@babel/types');
// api doc: https://babeljs.io/docs/en/next/babel-types
var requires = [];

const collectRequire = {
	CallExpression: {
		exit(path) {
			if (path.get('callee').node.name === 'require') {
				console.log(path.get('arguments')[0].node.value);
				requires.unshift(path);
			}
		}
	}
};

module.exports=function name(ast) {
    ast.traverse(ProgramTraverse);
    return babel.transformFromAstSync(ast);
}

function ProgramTraverse({ types: t }) {
	return {
		visitor: {
			Program: {
				enter(path, state) {
					// ra = null;
					// requires = [];
				},
				exit(path, state) {
					// console.log(JSON.stringify(state.file.ast));
					// path.traverse(collectRequire);

					// if (requires.length === 0) {
					// 	return false;
					// }

					// let hasRA = path.get('body').some((n) => {
					// 	if (
					// 		n.type === 'ExpressionStatement' &&
					// 		n.node.expression.type === 'CallExpression' &&
					// 		n.node.expression.callee &&
					// 		n.node.expression.callee.type === 'MemberExpression' &&
					// 		n.node.expression.callee.object.name === 'require' &&
					// 		n.node.expression.callee.property.name === 'async'
					// 	) {
					// 		ra = n;
					// 		return true;
					// 	}
					// });

					// if (hasRA) {
					// 	console.log('\n\n\n\n\nhasRa +++++++ ----\n\n\n\n\n')
					// 	let n = ra;
					// 	let raArgs = [],
					// 		raCallback = null;
					// 	if (ra.node.expression.arguments[0].type === 'ArrayExpression') {
					// 		raArgs = ra.node.expression.arguments[0];
					// 		raCallback = ra.node.expression.arguments[1];
					// 	}

					// 	requires.reverse().forEach((n, i) => {
					// 		let args = n.get('arguments');
					// 		args && raArgs.elements.unshift(args[0].node);

					// 		const varObj = path.scope.generateUidIdentifier('_require');

					// 		raCallback.params.unshift(varObj);

					// 		n.replaceWith(varObj);
					// 	});

					// 	const allPrevs = ra.getAllPrevSiblings();
					// 	allPrevs.reverse().forEach((n) => {
					// 		raCallback.body.body.unshift(n.node);
					// 		n.remove();
					// 	});
					// } else {
					// 	// writeFile(generateFile('before')(), JSON.stringify(state.file.ast))
					// 	// .then((d) => {
					// 	// 	console.log(`write file's ast : ${state.filename} success\n`);
					// 	// })
					// 	// .finally(() => {
					// 	// 	console.log(`[${new Date()}] write before ast error~`);
					// 	// });
					// 	const rArgs = [], params = [];
					// 	requires.forEach(n => {
					// 		let args = n.get('arguments');
					// 		args && rArgs.push(args[0].node);

					// 		const varObj = path.scope.generateUidIdentifier('_require');

					// 		params.push(varObj);

					// 		// TODO: if n is like to 'require('xxxx')', then should delete it
					// 		n.replaceWith(varObj); // var xxx = require('xxxx');
					// 	});

					// 	// create a new require.async(['x',...], function(x,...){});
					// 	const newRa = t.expressionStatement(
					// 		t.callExpression(t.memberExpression(t.identifier('require'), t.identifier('async')), [
					// 			t.arrayExpression(rArgs),
					// 			t.functionExpression(null, params, t.blockStatement(path.node.body))
					// 		])
					// 	);

					// 	path.node.body = [newRa];

						
					// }

					

					// writeFile(generateFile('after')(), JSON.stringify(state.file.ast))
					// 	.then((d) => {
					// 		console.log(`write file's ast : ${state.filename} success\n`);
					// 	})
					// 	.finally(() => {
					// 		console.log(`[${new Date()}] write after ast error~`);
					// 	});
				}
			}
		}
	};
};

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
