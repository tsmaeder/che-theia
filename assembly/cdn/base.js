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
exports.CheCdnSupport = void 0;
var CheCdnSupport = /** @class */ (function () {
    function CheCdnSupport(info) {
        this.info = info;
        this.noCDN = false;
        CheCdnSupport.instance = this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheCdnSupport.register = function (context) {
        context[CheCdnSupport.className] = CheCdnSupport;
    };
    CheCdnSupport.webpackLoader = function (source) {
        if (source.match(/^module\.exports ?\= ?"data:/)) {
            return source;
        }
        var urlContent = source.replace(/^module\.exports ?\= ?([^;]+);$/, '$1');
        return "module.exports = window." + CheCdnSupport.className + ".instance.resourceUrl(" + urlContent + ");";
    };
    CheCdnSupport.prototype.buildScripts = function () {
        var _this = this;
        this.info.chunks
            .map(function (entry) { return _this.url(entry.cdn, entry.chunk); })
            .forEach(function (url) {
            var script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            script.charset = 'utf-8';
            document.head.append(script);
        });
    };
    CheCdnSupport.prototype.buildScriptsWithoutCdn = function () {
        this.noCDN = true;
        this.buildScripts();
    };
    CheCdnSupport.prototype.url = function (withCDN, fallback) {
        var result = fallback;
        if (!this.noCDN && withCDN) {
            var request = new XMLHttpRequest();
            // eslint-disable-next-line space-before-function-paren
            request.onload = function () {
                if ((this.status >= 200 && this.status < 300) || this.status === 304) {
                    result = withCDN;
                }
            };
            try {
                request.open('HEAD', withCDN, false);
                request.send();
            }
            catch (err) {
                console.log("Error trying to access the CDN artifact '" + withCDN + "' : " + err);
                this.noCDN = true;
            }
        }
        return result;
    };
    CheCdnSupport.prototype.resourceUrl = function (path) {
        var cached = this.info.resources.find(function (entry) { return entry.resource === path; });
        if (cached) {
            return this.url(cached.cdn, cached.resource);
        }
        return path;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheCdnSupport.prototype.vsLoader = function (context) {
        var _this = this;
        var loaderURL = this.url(this.info.monaco.vsLoader.cdn, this.info.monaco.vsLoader.external);
        var request = new XMLHttpRequest();
        request.open('GET', loaderURL, false);
        request.send();
        new Function(request.responseText).call(context);
        if (this.info.monaco.vsLoader.cdn && loaderURL === this.info.monaco.vsLoader.cdn) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var pathsWithCdns_1 = {};
            this.info.monaco.requirePaths.forEach(function (path) {
                var jsFile = path.external + '.js';
                var jsCdnFile = path.cdn ? path.cdn + '.js' : undefined;
                if (_this.url(jsCdnFile, jsFile) === jsCdnFile) {
                    pathsWithCdns_1[path.external] = path.cdn;
                }
            });
            context.require.config({
                paths: pathsWithCdns_1,
            });
        }
    };
    CheCdnSupport.className = 'CheCdnSupport';
    return CheCdnSupport;
}());
exports.CheCdnSupport = CheCdnSupport;
//# sourceMappingURL=base.js.map