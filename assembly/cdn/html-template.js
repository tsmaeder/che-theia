"use strict";
/**********************************************************************
 * Copyright (c) 2018-2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdnHtmlTemplate = void 0;
var decls = require("./base");
var fs = require('fs-extra');
var CdnHtmlTemplate = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function CdnHtmlTemplate(htmlWebpackPlugin, compilation) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
        this.compilation = compilation;
        this.nocacheChunks = [];
        var cachedChunks = [];
        var cachedChunkRegexp = new RegExp(htmlWebpackPlugin.options.customparams.cachedChunkRegexp);
        var cachedResourceRegexp = new RegExp(htmlWebpackPlugin.options.customparams.cachedResourceRegexp);
        var cdnPrefix = htmlWebpackPlugin.options.customparams.cdnPrefix
            ? htmlWebpackPlugin.options.customparams.cdnPrefix
            : '';
        var monacoCdnPrefix = htmlWebpackPlugin.options.customparams.monacoCdnPrefix
            ? htmlWebpackPlugin.options.customparams.monacoCdnPrefix
            : '';
        var monacoEditorCorePackage = htmlWebpackPlugin.options.customparams.monacoEditorCorePackage
            ? htmlWebpackPlugin.options.customparams.monacoEditorCorePackage
            : '';
        // eslint-disable-next-line guard-for-in
        for (var key in htmlWebpackPlugin.files.chunks) {
            var url = htmlWebpackPlugin.files.chunks[key].entry;
            var chunk = {
                chunk: url,
                cdn: undefined,
            };
            if (cdnPrefix && url.match(cachedChunkRegexp)) {
                chunk.cdn = cdnPrefix + url;
                cachedChunks.push(chunk);
            }
            else {
                this.nocacheChunks.push(chunk);
            }
        }
        var cachedResourceFiles = [];
        if (cdnPrefix) {
            var asset = void 0;
            for (asset in compilation.assets) {
                if (asset.match(cachedResourceRegexp)) {
                    cachedResourceFiles.push({
                        resource: asset,
                        cdn: cdnPrefix + asset,
                    });
                }
            }
        }
        var vsLoader = {
            external: './vs/original-loader.js',
            cdn: undefined,
        };
        var monacoEditorCorePath = {
            external: 'vs/editor/editor.main',
            cdn: undefined,
        };
        if (monacoCdnPrefix) {
            vsLoader.cdn = monacoCdnPrefix + monacoEditorCorePackage + '/min/vs/loader.js';
            monacoEditorCorePath.cdn =
                monacoCdnPrefix + monacoEditorCorePackage + '/min/' + monacoEditorCorePath.external;
        }
        var monacoRequirePaths = [monacoEditorCorePath];
        if (cdnPrefix || monacoCdnPrefix) {
            var monacoFiles = monacoRequirePaths
                .map(function (elem) {
                return ['.js', '.css', '.nls.js']
                    .map(function (extension) { return ({
                    external: elem.external + extension,
                    cdn: elem.cdn + extension,
                }); })
                    .filter(function (elemt) { return compilation.assets[elemt.external]; });
            })
                .reduce(function (acc, val) { return acc.concat(val); }, []);
            monacoFiles.push(vsLoader);
            fs.ensureDirSync('lib');
            fs.writeFileSync('lib/cdn.json', JSON.stringify(cachedChunks
                .concat(monacoFiles)
                .concat(cachedResourceFiles), undefined, 2));
        }
        this.cdnInfo = {
            chunks: cachedChunks,
            resources: cachedResourceFiles,
            monaco: {
                vsLoader: vsLoader,
                requirePaths: monacoRequirePaths,
            },
        };
    }
    CdnHtmlTemplate.prototype.generateCdnScript = function () {
        return "new " + decls.CheCdnSupport.className + "(" + JSON.stringify(this.cdnInfo) + ").buildScripts();";
    };
    return CdnHtmlTemplate;
}());
exports.CdnHtmlTemplate = CdnHtmlTemplate;
//# sourceMappingURL=html-template.js.map