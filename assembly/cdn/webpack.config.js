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
var webpack_customizer_1 = require("./webpack-customizer");
var yargs = require('yargs');
var _a = yargs
    .option('env.cdn', {
    description: "The path of a JSON file that contains CDN settings.\n    The file syntax is the following:\n    {\n      theia: 'Base URL of the CDN that will host Theia files',\n      monaco: 'Base URL of the CDN that will host Monaco Editor files'\n    }",
    type: 'string',
    default: '',
})
    .option('env.monacopkg', {
    description: 'The NPM identifier (with version) of Monaco editor core package',
    type: 'string',
    default: '',
}).argv.env, cdn = _a.cdn, monacopkg = _a.monacopkg;
// Retrieve the default, generated, Theia Webpack configuration
var baseConfig = require('../webpack.config');
webpack_customizer_1.customizeWebpackConfig(cdn, monacopkg, baseConfig);
// Export the customized webpack configuration object
module.exports = baseConfig;
//# sourceMappingURL=webpack.config.js.map