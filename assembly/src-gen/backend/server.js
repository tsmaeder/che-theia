// @ts-check
require('reflect-metadata');

// Patch electron version if missing, see https://github.com/eclipse-theia/theia/pull/7361#pullrequestreview-377065146
if (typeof process.versions.electron === 'undefined' && typeof process.env.THEIA_ELECTRON_VERSION === 'string') {
    process.versions.electron = process.env.THEIA_ELECTRON_VERSION;
}

const path = require('path');
const express = require('express');
const { Container } = require('inversify');
const { BackendApplication, CliManager } = require('@theia/core/lib/node');
const { backendApplicationModule } = require('@theia/core/lib/node/backend-application-module');
const { messagingBackendModule } = require('@theia/core/lib/node/messaging/messaging-backend-module');
const { loggerBackendModule } = require('@theia/core/lib/node/logger-backend-module');

const container = new Container();
container.load(backendApplicationModule);
container.load(messagingBackendModule);
container.load(loggerBackendModule);

function load(raw) {
    return Promise.resolve(raw.default).then(module =>
        container.load(module)
    )
}

function start(port, host, argv) {
    if (argv === undefined) {
        argv = process.argv;
    }

    const cliManager = container.get(CliManager);
    return cliManager.initializeCli(argv).then(function () {
        const application = container.get(BackendApplication);
        application.use(express.static(path.join(__dirname, '../../lib')));
        application.use(express.static(path.join(__dirname, '../../lib/index.html')));
        return application.start(port, host);
    });
}

module.exports = (port, host, argv) => Promise.resolve()
    .then(function () { return Promise.resolve(require('@theia/core/lib/node/hosting/backend-hosting-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/filesystem/lib/node/filesystem-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/filesystem/lib/node/download/file-download-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/workspace/lib/node/workspace-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/process/lib/common/process-common-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/process/lib/node/process-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/terminal/lib/node/terminal-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/task/lib/node/task-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/debug/lib/node/debug-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/file-search/lib/node/file-search-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/metrics/lib/node/metrics-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/mini-browser/lib/node/mini-browser-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/search-in-workspace/lib/node/search-in-workspace-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/plugin-ext/lib/plugin-ext-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/plugin-dev/lib/node/plugin-dev-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/plugin-ext-vscode/lib/node/plugin-vscode-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-remote-api/lib/node/che-remote-api-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-plugin-ext/lib/node/che-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-remote/lib/node/plugin-remote-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-user-preferences-synchronizer/lib/node/che-theia-user-preferences-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/che-theia-hosted-plugin-manager-extension/lib/node/hosted-plugin-manager-contribution-extension-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-activity-tracker/lib/node/che-theia-activity-tracker-server-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-git-provisioner/lib/node/git-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-logging/lib/node/formatted-console-logger-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-messaging/lib/node/messaging/che-messaging-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-mini-browser/lib/node/che-mini-browser-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@eclipse-che/theia-cli-endpoint/lib/node/cli-backend-module')).then(load) })
    .then(() => start(port, host, argv)).catch(reason => {
        console.error('Failed to start the backend application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });