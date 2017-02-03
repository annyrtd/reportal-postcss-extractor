'use strict';

const fs = require('fs');
const path = require('path');
const extractVariables = require('./variableExtracter');
const getExtractedCss = require('./cssExtraxter');
const transformCssToJsVariables = require('./cssToJsTransformer').transformCssToJsVariables;
const transformCssToReportalConfig = require('./cssToJsTransformer').transformCssToReportalConfig;

class ReportalPostCssExtracter {
    constructor({filePath, toReportalScripts = true, variableNameRegExp = /\$\S+/}) {
        this.fileWithVariables = path.resolve(filePath);
        this.toReportalScripts = toReportalScripts;
        this.variableNameRegExp = variableNameRegExp;
    }

    saveToAssets (compilation, fileName, fileContent) {
        compilation.assets[fileName] = {
            source: function () {
                return new Buffer(fileContent)
            },
            size: function () {
                return Buffer.byteLength(fileContent)
            }
        };
    };

    apply (compiler) {
        compiler.plugin("emit", (compilation, callback) => {
            fs.readFile(this.fileWithVariables, 'utf8', (err, data) => {
                if (err) {
                    throw new Error('file with settings cannot be found!\n' + this.fileWithVariables)
                }

                const styleFilesSources = Object
                    .keys(compilation.assets)
                    .filter(fileName => /\.s?css$/.test(fileName))
                    .map(fileName => compilation.assets[fileName].source());

                const variablesToExtract = extractVariables(data, this.variableNameRegExp);
                const compressedCssConfig = getExtractedCss(styleFilesSources, variablesToExtract);
                const compressedCss = compressedCssConfig.map(item => item.style).join('\n');

                //this.saveToAssets(compilation, 'config.css', compressedCss);

                let jsSource;
                if (this.toReportalScripts) {
                    jsSource = transformCssToReportalConfig(compressedCssConfig);
                } else {
                    jsSource = transformCssToJsVariables(compressedCss, variablesToExtract);
                }

                this.saveToAssets(compilation, 'config.js', jsSource);

                callback();
            });
        });
    }
}

module.exports = ReportalPostCssExtracter;