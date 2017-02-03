const csso = require('csso');

class StylePiece {
    constructor({selector, property, fullValue}) {
        this.selector = selector;
        this.property = property;
        this.fullValue = fullValue;
    }

    toString() {
        return this.selector + '{ ' + this.property + ': ' + this.fullValue + '; }';
    }
}

function getExtractedCss(styleFilesSources, variablesToExtract) {
    const stylePieces = getAllStylePieces(styleFilesSources, variablesToExtract);

    //return stylePieces.map(item => item.toString()).join('\n');
    //return csso.minify(stylePieces.map(item => item.toString()).join('\n')).css; //.split('}').join('}\n');

    return stylePieces.map(stylePiece => ({
        variable: stylePiece.variable,
        styles: csso.minify(stylePiece.styles.map(item => item.toString()).join('\n')).css
    }));
}

function getAllStylePieces(styleFilesSources, variablesToExtract) {
    const stylePieces = [];
    const source = styleFilesSources.join('\n');

    variablesToExtract.forEach(variable => {
        const value = variable.value;
        const extractedStrings = extractCssLinesWithValue(source, value);
        if (!extractedStrings)
            return;

        stylePieces.push({
            variable,
            styles: getStylePiecesForOneVariable(extractedStrings, value)
        });
        //stylePieces.push(...getStylePiecesForOneVariable(extractedStrings, value));
    });

    return stylePieces;
}

function extractCssLinesWithValue(content, value) {
    const reqExp = new RegExp("}(?:(?!\\})(.|\\n))*" + value + "(?:(?![;\\}])(.|\\n))*[;\\}]", "gi"); ///}(?:(?!\}).)*#F0A62F/gi
    return content.match(reqExp);
}

function getStylePiecesForOneVariable(extractedStrings, value) {
    const stylePieces = [];

    extractedStrings.forEach(item => {
        stylePieces.push(...getStylePiecesFromOneExtractedString(item, value));
    });

    return stylePieces;
}

function getStylePiecesFromOneExtractedString(item, value) {
    const stylePieces = [];

    let str = item.substr(0, item.length - 1);
    const openCurlyBracketIndex = str.indexOf('{');
    const selector = str.substring(1, openCurlyBracketIndex);
    while (str.length && str.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        const colonLastIndex = str.lastIndexOf(':');
        const semiColonLastIndex = str.lastIndexOf(';');
        const openCurlyBracketLastIndex = str.lastIndexOf('{');
        const propertyStartIndex = Math.max(semiColonLastIndex, openCurlyBracketLastIndex) + 1;
        const property = str.substring(propertyStartIndex, colonLastIndex);
        const fullValue = str.substring(colonLastIndex + 1);

        if (fullValue.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            stylePieces.push(new StylePiece({selector, property, fullValue}));
        }

        str = str.substring(0, propertyStartIndex - 1)
    }

    return stylePieces;
}

module.exports = getExtractedCss;