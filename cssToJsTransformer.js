function transformCssToJsVariables(css, variablesToExtract) {
    const vars = [];
    let cssToJs = css;
    variablesToExtract.forEach((variable, index) => {
        const variableName = makeValidForJs(variable.name);
        if (cssToJs.toLowerCase().indexOf(variable.value.toLowerCase()) >= 0) {
            vars.push(`var ${variableName} = "${variable.value}";`);
            cssToJs = cssToJs.replace(new RegExp(variable.value, "ig"), `" + ${variableName} +\n"`);
        }
    });

    return `${vars.join('\n')}\n\nvar str = "${cssToJs}";`;
}

function transformCssToReportalConfig(cssPieces) {
    const vars = [], varsForConfig = [];
    let cssToJsPieces = [];
    const className = 'Config';
    const classFieldName = 'Design';

    cssPieces.forEach((piece, index) => {
        const variable = piece.variable;
        const styles = piece.styles;
        const variableNameInConfig = makeValidForJs(variable.name);
        const variableName = `var${index + 1}`;
        const cssToJs = styles.replace(new RegExp(variable.value, "ig"), `" + ${variableName} +\n\t\t"`);

        vars.push(`var ${variableName} = ${className}.${classFieldName}.${variableNameInConfig};`);
        varsForConfig.push(`${variableNameInConfig}: "${variable.value}"`);
        cssToJsPieces.push({variableName, cssToJs});
    });

    let result = `class ${className} {\n` +
        `\tstatic var ${classFieldName} = {\n` +
        `\t\t${varsForConfig.join(',\n\t\t')}\n` +
        `\t}\n` +
        `}\n\n\n\n` +
        `var str = "\<style>";\n\n`;

    vars.forEach((variable,index) => {
        result += `${variable}\n` +
            `if (${cssToJsPieces[index].variableName}) {\n` +
            `\tstr += "${cssToJsPieces[index].cssToJs}";\n` +
            `}\n\n`;
    });

    result += `str += "\</style>";\n\n` +
        `text.Output.Append(str);`;

    return result;
}

function makeValidForJs(name) {
    return name.replace(/^\d+/, '').replace(/[^\a-zA-Z_\d]/g, '');
}

module.exports = {transformCssToReportalConfig, transformCssToJsVariables};