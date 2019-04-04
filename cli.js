#!/usr/bin/env node
'use strict'

const path = require('path')

// drop `node` and `cli.js`, the actual parameters come after those
const {
	_: targetNames,
	'--': filePaths,
} = require('minimist')(process.argv.slice(2), { '--': true })

const fs = require('./fs')

const [
	sourcePath,
	dirPath,
] = filePaths

const extension = path.extname(sourcePath)
const basename = path.basename(sourcePath, extension)

fs(
	path.resolve(sourcePath),
	targetNames.map(targetName => [
		targetName.toUpperCase(),
		path.resolve(dirPath || '.', `${basename}.${targetName.toLowerCase()}${extension}`),
	]),
)
