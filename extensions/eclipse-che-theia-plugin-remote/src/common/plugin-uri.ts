/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

/**
 * Share the definition of plugin resource uris between back end and
 * front end.
 */
export namespace PluginUri {
  export const SCHEME = 'pluginresource';

  export function createUri(pluginId: string, relativePath: string) {
    return `${SCHEME}://${pluginId}/${relativePath}`;
  }
}
