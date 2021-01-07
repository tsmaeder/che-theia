/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import * as path from 'path';

import { PluginPackage, SnippetContribution } from '@theia/plugin-ext/lib/common';

import { FileUri } from '@theia/core/lib/node/file-uri';
import { TheiaPluginScanner } from '@theia/plugin-ext/lib/hosted/node/scanners/scanner-theia';
import { VsCodePluginScanner } from '@theia/plugin-ext-vscode/lib/node/scanner-vscode';

export class CheTheiaPluginScanner extends TheiaPluginScanner {
  protected readSnippets(pck: PluginPackage): SnippetContribution[] | undefined {
    return readSnippets(pck);
  }
}

export class CheVsCodePluginScanner extends VsCodePluginScanner {
  protected readSnippets(pck: PluginPackage): SnippetContribution[] | undefined {
    return readSnippets(pck);
  }
}

/**
 * Override reading snippet contributions to use plugin resource uris instead of
 * file uris.
 */
function readSnippets(pck: PluginPackage): SnippetContribution[] | undefined {
  if (!pck.contributes || !pck.contributes.snippets) {
    return undefined;
  }
  const result: SnippetContribution[] = [];
  for (const contribution of pck.contributes.snippets) {
    if (contribution.path) {
      let uri = FileUri.create(path.join(pck.packagePath, contribution.path));
      const machineName = process.env.CHE_MACHINE_NAME;
      if (machineName) {
        uri = uri.withScheme(`file-sidecar-${machineName}`);
      }

      result.push({
        language: contribution.language,
        source: pck.displayName || pck.name,
        uri: uri.toString(),
      });
    }
  }
  return result;
}
