const multipleBlankLines = /\n{3,}/g;
const singleBlankLine = "\n\n";

module.exports = function sievery( sourceData, targets ) {
	if (!sourceData) {
		throw new TypeError('sourceData must not be empty')
	}

	if (typeof sourceData !== 'string') {
		throw new TypeError('sourceData must be a string')
	}

	const lines = sourceData.split( '\n' )
	const codes = new Array( targets.length )

	const normalMode = -1
	const targetMode = targets.length
	let excludeMode = 0

	let mode = normalMode

	const targetMarkers = targets.map( target => ( {
		line: lineMarker( target ),
		start: startMarker( target ),
		end: endMarker( target )
	} ) )


	targetMarkers.forEach( ( target, index ) => {
		const excludes = targetMarkers.filter( item => item !== target )
		const code = []

		lines.forEach( line => {
			if ( mode === excludeMode ) {
				if ( excludes[ excludeMode ].end.test( line ) ) {
					mode = normalMode
				}
				return
			}
			if ( mode === targetMode ) {
				if ( target.end.test( line ) ) {
					mode = normalMode
					return
				}

				code.push( line )
				return
			}

			if ( target.line.test( line ) ) {
				code.push( line.replace( target.line, '' ) )
				return
			}

			if ( target.start.test( line ) ) {
				mode = targetMode
				return
			}

			for ( let i = 0; i < excludes.length; i++ ) {
				if ( excludes[ i ].line.test( line ) ) {
					return
				}

				if ( excludes[ i ].start.test( line ) ) {
					mode = excludeMode = i
					return
				}
			}

			code.push( line )
		} )

		codes[ index ] = code.join( '\n' ).replace( multipleBlankLines, singleBlankLine )
	} )

	return codes
}

function lineMarker( token ) {
	return new RegExp( ` // ${token}$` )
}
function startMarker( token ) {
	return new RegExp( `// ${token}/$` )
}
function endMarker( token ) {
	return new RegExp( `// /${token}$` )
}
