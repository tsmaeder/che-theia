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

import { PluginPackage, SnippetContribution, getPluginId } from '@theia/plugin-ext/lib/common';

import { ChePluginUri } from '../common/che-plugin-uri';
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
      const absolutePath = path.join(pck.packagePath, contribution.path);
      const normalizedPath = path.normalize(absolutePath);
      const relativePath = path.relative(pck.packagePath, normalizedPath);
      result.push({
        language: contribution.language,
        source: pck.displayName || pck.name,
        uri: ChePluginUri.createUri(getPluginId(pck), relativePath),
      });
    }
  }
  return result;
}
