/*********************************************************************
 * Copyright (c) 2018-2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import * as theia from '@theia/plugin';
import * as fs from 'fs-extra';
import { FileSystemError } from '@theia/plugin-ext/lib/plugin/types-impl';


export class SidecarFilesystemProvider implements theia.FileSystemProvider {
    onDidChangeFile: theia.Event<theia.FileChangeEvent[]>;    watch(uri: theia.Uri, options: { recursive: boolean; excludes: string[]; }): theia.Disposable {
        throw new Error("Method not implemented.");
    }
    stat(uri: theia.Uri): theia.FileStat | PromiseLike<theia.FileStat> {
        throw new Error("Method not implemented.");
    }
    readDirectory(uri: theia.Uri): [string, theia.FileType][] | PromiseLike<[string, theia.FileType][]> {
        throw new Error("Method not implemented.");
    }
    createDirectory(uri: theia.Uri): void | PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
    readFile(uri: theia.Uri): Uint8Array | PromiseLike<Uint8Array> {
        if (fs.pathExistsSync(uri.fsPath)) {
            return fs.readFileSync(uri.fsPath);
        }   
        throw FileSystemError.FileExists(uri);
    }
    writeFile(uri: theia.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
    delete(uri: theia.Uri, options: { recursive: boolean; }): void | PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
    rename(oldUri: theia.Uri, newUri: theia.Uri, options: { overwrite: boolean; }): void | PromiseLike<void> {
        throw new Error("Method not implemented.");
    }


}
