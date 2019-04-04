# sievery
Removes unwanted lines from files

npx sievery modern legacy -- index.js
> index.modern.js index.legacy.js


+ [What it is](#what-it-is)
	+ [What it does](#what-it-does)
	+ [What it does not](#what-it-does-not)
	+ [When to use](#when-to-use)
	+ [When not to use](#when-not-to-use)
+ [How to use it](#how-to-use-it)
	+ [node API](#node-api)
	+ [CLI](#cli)
	+ [Markers](#markers)


----


# What it is
+ [What it does](#what-it-does)
+ [What it does not](#what-it-does-not)
+ [When to use](#when-to-use)
+ [When not to use](#when-not-to-use)

## What it does
`sievery` turns this:
```js
const submitButtons = document.querySelectorAll( 'button[type=submit]:not([data-ajax])' ) // MODERN

// LEGACY/
var submitButtons = []
var buttons = document.getElementsByTagName( 'button' )

for ( var i = 0; i < buttons.length; i++ ) {
	var button = buttons[ i ]

	if ( button.type === 'submit' && !button.hasAttribute( 'data-ajax' ) ) {
		submitButtons.push(button)
	}
}
// /LEGACY

return submitButtons
```

into these:
```js
const submitButtons = document.querySelectorAll( 'button[type=submit]:not([data-ajax])' )

return submitButtons
```
```js
var submitButtons = []
var buttons = document.getElementsByTagName( 'button' )

for ( var i = 0; i < buttons.length; i++ ) {
	var button = buttons[ i ]

	if ( button.type === 'submit' && !button.hasAttribute( 'data-ajax' ) ) {
		submitButtons.push(button)
	}
}

return submitButtons
```

> **NOTE:** See [Markers](#markers) if you need clarification on the semantics of the markers shown above.


## What it does not
`sievery` does not actually care about the contents of your file.
You can use it for JS, CSS, HTML, Markdown, C#, CSV, and any other text file.

## When to use
`sievery`'s primary intended use-case is splitting a single source file into multiple distributable files of largely the same content, hence the modern/legacy sample above.

## When not to use
If all you need is a dual export to CJS/ESM, take a look at [sievery](https://www.npmjs.com/package/sievery). It's probably the a better fit. Depending on your needs, you may even combine them.

If your project is very large, you're probably using webpack or something like that. Take a look at [webpack's DefinePlugin](https://webpack.js.org/plugins/define-plugin/) – together with dead code removal, it will cover most JS-based use-cases of `sievery`. If you're using another sophisticated build environment, look into their solution to your problem first.

If you have a large project without such a build environment, think seriously about adopting [webpack](https://webpack.js.org), it's popular for a reason: it's awesome!


# How to use it
+ [node API](#node-api)
+ [CLI](#cli)
+ [Markers](#markers)


## node API
You can import either `sievery` or `sievery/fs`, depending on how you will use it.

`sievery` takes two mandatory arguments:
+ `sourceData`: a string containing the text you want to sift
+ `targets`: an array of strings use to mark your different output targets

`sievery/fs` is a thin wrapper around `sievery` that reads and writes files. It takes two mandatory arguments:
+ `sourcePath`: the path to the file containing the text you want to sift
+ `targets`: an array of string pairs:
  + the first string in each pair is the token used to mark the target in your source
  + the second string is the path to the file where the variant is to be written

And that is it.

### Examples
#### Using `sievery`
```js
const sievery = require('sievery')
const sourceData = getSourceData()
const [modernVariant, legacyVariant] = sievery(sourceData, ['MODERN', 'LEGACY'])
```
This is how you achieve the result from [What it does](#what-it-does)


#### Using `sievery/fs`
```js
const sieveryFS = require('sievery/fs')
sieveryFS(
	'index.js',
	[
		['MODERN', 'modern.js'],
		['LEGACY', 'legacy.js'],
	]
)
```
Same result, but in files, not in memory.

> **NOTE:** if the target paths include directories, those will be created if they don't exist.


## CLI
```bash
npx sievery <targetNames> -- <sourcePath> [<outDir>]
```

The CLI passes the given arguments through to the underlying node API, and works through `sievery/fs`.

> **IMPORTANT:**
> The given target names are upper-cased for the tokens in your source, and lower-cased for the file names.
> That makes the command-line input case-insensitive, but the source file content very much case-sensitive.
>
> Consequently, if you want to have full control over letter-case, you need to use the node API!


### Examples
#### The basic form
```sh
npx sievery modern legacy -- index.js
```

This reads `index.js` and writes variants `index.modern.js` and `index.legacy.js`, based on the tokens `MODERN` and `LEGACY`.


#### Giving a target directory
```sh
npx sievery modern legacy -- index.js dist/
```

The same result, but `index.modern.js` and `index.legacy.js` are written into `dist/`.

> **NOTE:** if the target directory doesn't exist, it will be created.


## Markers
`sievery` takes string tokens to look for (see below), and turns them into markers that will trigger specific behaviour when found in source data.

For example, given the token `"TOKEN"`, it will react to ` // TOKEN`, ` // TOKEN/`  (note the trailing slash), and ` // /TOKEN` (note the slash before the token). What each means will explained next.

For better understanding, the following will assume using the tokens `MODERN` and `LEGACY`. Where relevant, the current iteration will be assumed to be `MODERN`.

When `sievery` encounters a line ending in ` // MODERN`, it will include that line in its output, but remove the marker.

When `sievery` encounters a line ending in ` // LEGACY`, it will drop that line.

When `sievery` encounters a line ending in ` // MODERN/`, it will drop that line but include every line until it encounters a line ending in ` // /MODERN`. That line will be dropped.

When `sievery` encounters a line ending in ` // LEGACY/`, it will drop that line and every line until it encounters a line ending in ` // /LEGACY`. That line will be dropped.
