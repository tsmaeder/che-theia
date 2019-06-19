/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject } from 'inversify';
import * as theia from '@theia/plugin';
import { che as cheApi } from '@eclipse-che/api';
import { TaskConfiguration } from '@eclipse-che/plugin';
import { resolve } from 'path';
import { writeFileSync, modify } from '../utils';
import { CheTaskConfigsExtractor } from '../extract/che-task-configs-extractor';
import { VsCodeTaskConfigsExtractor } from '../extract/vscode-task-configs-extractor';
import { ConfigurationsExporter } from './export-configs-manager';
import { ConfigFileTasksExtractor } from '../extract/config-file-task-configs-extractor';

const CONFIG_DIR = '.theia';
const TASK_CONFIG_FILE = 'tasks.json';
const formattingOptions = { tabSize: 4, insertSpaces: true, eol: '' };

export const VSCODE_TASK_TYPE = 'vscode-task';

/** Exports configurations of tasks in the config file. */
@injectable()
export class TaskConfigurationsExporter implements ConfigurationsExporter {

    @inject(ConfigFileTasksExtractor)
    protected readonly configFileTasksExtractor: ConfigFileTasksExtractor;

    @inject(CheTaskConfigsExtractor)
    protected readonly cheTaskConfigsExtractor: CheTaskConfigsExtractor;

    @inject(VsCodeTaskConfigsExtractor)
    protected readonly vsCodeTaskConfigsExtractor: VsCodeTaskConfigsExtractor;

    export(workspaceFolder: theia.WorkspaceFolder, commands: cheApi.workspace.Command[]): void {
        const tasksConfigFileUri = this.getConfigFileUri(workspaceFolder.uri.path);
        const configFileTasks = this.configFileTasksExtractor.extract(tasksConfigFileUri);

        const cheTasks = this.cheTaskConfigsExtractor.extract(commands);
        const vsCodeTasks = this.vsCodeTaskConfigsExtractor.extract(commands);
        const newConfigs = this.merge(vsCodeTasks.configs, cheTasks);

        const configFileContent = configFileTasks.content;
        if (configFileContent) {
            this.saveConfigs(tasksConfigFileUri, configFileContent, this.merge(newConfigs, configFileTasks.configs));
            return;
        }

        const vsCodeTasksContent = vsCodeTasks.content;
        if (vsCodeTasksContent) {
            this.saveConfigs(tasksConfigFileUri, vsCodeTasksContent, newConfigs);
            return;
        }

        if (cheTasks) {
            this.saveConfigs(tasksConfigFileUri, '', cheTasks);
        }
    }

    private merge(configurations1: TaskConfiguration[], configurations2: TaskConfiguration[]): TaskConfiguration[] {
        const result: TaskConfiguration[] = Object.assign([], configurations1);

        for (const config2 of configurations2) {
            const conflict = configurations1.find(config1 => config1.label === config2.label);
            if (!conflict) {
                result.push(config2);
                continue;
            }

            if (this.areEqual(config2, conflict)) {
                continue;
            }

            const newLabel = this.getUniqueLabel(config2.label, [...configurations1, ...configurations2]);
            result.push({ ...config2, label: newLabel });
        }

        return result;
    }

    private areEqual(config1: TaskConfiguration, config2: TaskConfiguration): boolean {
        const { type: type1, label: label1, ...properties1 } = config1;
        const { type: type2, label: label2, ...properties2 } = config2;

        if (type1 !== type2 || label1 !== label2) {
            return false;
        }

        return JSON.stringify(properties1) === JSON.stringify(properties2);
    }

    private getUniqueLabel(label: string, configs: TaskConfiguration[]): string {
        let counter = 1;
        let newLabel = '';

        do {
            newLabel = `${label}_${counter}`;
            counter++;
        } while (configs.some(config => config.label === newLabel));

        return newLabel;
    }

    private getConfigFileUri(rootDir: string): string {
        return resolve(rootDir.toString(), CONFIG_DIR, TASK_CONFIG_FILE);
    }

    private saveConfigs(tasksConfigFileUri: string, content: string, configurations: TaskConfiguration[]) {
        const result = modify(content, ['tasks'], configurations, formattingOptions);
        writeFileSync(tasksConfigFileUri, result);
    }
}
