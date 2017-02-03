function extractVariables(content, variableNameRegExp) {
    const allVariablesRegExp = new RegExp('\\s+' + variableNameRegExp.source +'\\s*:\\s*\\S+\\s*;', 'g');
    const allVariables = content
        .match(allVariablesRegExp)
        .map(item => {
            const regExp = new RegExp('\\s+(' + variableNameRegExp.source +')\\s*:\\s*(\\S+)\\s*;');
            const searchResults = item.match(regExp);
            return {
                name: searchResults[1],
                value: searchResults[2]
            }
        })
        // TODO: how to test variables dependencies?
        .filter(item => !variableNameRegExp.test(item.value[0]));

    return getDistinct(allVariables, item => item.value);
}

function getDistinct(array, getId = item => item){
    const u = {}, a = [];
    let l = array.length;
    for(let i = 0 ; i < l; ++i){
        if(u.hasOwnProperty(getId(array[i]))) {
            continue;
        }
        a.push(array[i]);
        u[array[i].value] = 1;
    }
    return a;
}

module.exports = extractVariables;