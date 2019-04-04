const fs = require('fs-extra')

const sievery = require('.')


module.exports = function sieveryFS ( sourcePath, targets ) {
	const targetTokens = targets.map(([token]) => token)
	const targetPaths = targets.map(([, filePath]) => filePath)

	const sourceData = fs.readFileSync(sourcePath).toString()
	const outFiles = sievery(sourceData, targetTokens)

	outFiles.forEach((fileData, i) => fs.outputFileSync(targetPaths[i], fileData))
}
