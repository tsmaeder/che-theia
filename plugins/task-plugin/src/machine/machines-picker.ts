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
import { CheWorkspaceClient } from '../che-workspace-client';

const MACHINES_PLACE_HOLDER = 'Pick a machine to run the task';
const RECIPE_CONTAINER_SOURCE = 'recipe';
const CONTAINER_SOURCE_ATTRIBUTE = 'source';

@injectable()
export class MachinesPicker {

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient!: CheWorkspaceClient;

    private isOpen: boolean;
    private hideToolContainers: boolean;

    /**
     * Returns a machine name if there's just one machine in the current workspace.
     * Shows a quick open widget allows to pick a machine if there are several ones.
     */
    async pick(): Promise<string> {

        console.log('isOpen: ' + this.isOpen);
        console.log('hideToolContainers: ' + this.hideToolContainers);

        if (this.isOpen) {
            // trigger show/hide tool containers
            this.hideToolContainers = !this.hideToolContainers;
        } else {
            this.isOpen = true;
            this.hideToolContainers = true;
        }

        console.log('isOpen after: ' + this.isOpen);
        console.log('hideToolContainers after: ' + this.hideToolContainers);

        const machines = await this.getMachines(this.hideToolContainers);
        console.log('machines length: ' + machines.length);
        console.log('machines: ' + machines);
        if (machines.length === 1) {
            return Promise.resolve(machines[0]);
        }

        const items: string[] = [];
        for (const machineName of machines) {
            items.push(machineName);
        }

        console.log('constructed items: ' + items);

        return this.showMachineQuickPick(items);
    }

    protected async getMachines(hideToolContainers: boolean): Promise<string[]> {
        const machineNames: string[] = [];
        const machines = await this.cheWorkspaceClient.getMachines();
        console.log('machines from client: ' + machines);
        if (!machines) {
            return machineNames;
        }

        for (const machineName in machines) {
            if (!machines.hasOwnProperty(machineName)) {
                continue;
            }
            console.log('process: ' + machineName);

            if (hideToolContainers) {
                const machine = machines[machineName];
                if (machine.attributes && (!machine.attributes[CONTAINER_SOURCE_ATTRIBUTE] || machine.attributes[CONTAINER_SOURCE_ATTRIBUTE] === RECIPE_CONTAINER_SOURCE)) {
                    continue;
                }
            }

            console.log('add into machines names: ' + machineName);

            machineNames.push(machineName);
        }

        return machineNames;
    }

    private showMachineQuickPick(items: string[]): Promise<string> {
        return new Promise<string>(resolve => {

            const options = { placeHolder: MACHINES_PLACE_HOLDER } as theia.QuickPickOptions;
            options.onDidSelectItem = (item => {
                const machineName = typeof item === 'string' ? item : item.label;
                resolve(machineName);
            });
            theia.window.showQuickPick(items, options);
        });
    }
}
