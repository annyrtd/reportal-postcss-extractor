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

function transformCssToReportalConfig(css, variablesToExtract) {
    const vars = [], varsForConfig = [];
    let cssToJs = css;
    const className = 'Config';
    const classFieldName = 'Design';

    variablesToExtract.forEach((variable, index) => {
        const variableNameInConfig = makeValidForJs(variable.name);
        const variableName = `var${index + 1}`;
        if (cssToJs.toLowerCase().indexOf(variable.value.toLowerCase()) >= 0) {
            varsForConfig.push(`${variableNameInConfig}: "${variable.value}"`);
            vars.push(`var ${variableName} = ${className}.${classFieldName}.${variableNameInConfig};`);
            cssToJs = cssToJs.replace(new RegExp(variable.value, "ig"), `" + ${variableName} +\n"`);
        }
    });

    return `class ${className} {\n` +
        `\tstatic var ${classFieldName} = {\n` +
        `\t\t${varsForConfig.join(',\n\t\t')}\n` +
        `\t}\n` +
        `}\n\n\n\n` +
        `${vars.join('\n')}\n\nvar str = "\<style>" + \n"${cssToJs}" + \n"\</style>";\n\n` +
        `text.Output.Append(str);`;
}

function makeValidForJs(name) {
    return name.replace(/^\d+/, '').replace(/[^\a-zA-Z_\d]/g, '');
}

module.exports = {transformCssToReportalConfig, transformCssToJsVariables};