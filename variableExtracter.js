function extractVariables(content) {
    const allVariables = content
        .match(/\$\S+\s*:\s*\S+\s*;/g)
        .map(item => {
            const searchResults = item.match(/(\$\S+\s*):\s*(\S+)\s*;/);
            return {
                name: searchResults[1],
                value: searchResults[2]
            }
        })
        .filter(item => item.value[0] != '$');

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