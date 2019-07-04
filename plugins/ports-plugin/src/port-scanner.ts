/*********************************************************************
* Copyright (c) 2019 Red Hat, Inc.
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
**********************************************************************/

import { Port } from './port';
import { IpConverter } from './ip-converter';
import { readFile } from 'fs';

/**
 * Allow to grab ports being opened and on which network interface
 * @author Florent Benoit
 */
export class PortScanner {

    public static readonly PORTS_IPV4 = '/proc/net/tcp';
    public static readonly PORTS_IPV6 = '/proc/net/tcp6';

    private fetchTCP4 = true;
    private fetchTCP6 = true;

    public readFilePromise(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err: NodeJS.ErrnoException, data: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }

    /**
     * Get opened ports.
     */
    public async getListeningPorts(): Promise<Port[]> {

        const ipConverter = new IpConverter();
        const outputv4 = this.fetchTCP4 ?
            this.readFilePromise(PortScanner.PORTS_IPV4)
                .catch(e => {
                    console.error(e);
                    this.fetchTCP4 = false;
                }) : '';
        const outputv6 = this.fetchTCP6 ?
            this.readFilePromise(PortScanner.PORTS_IPV6)
                .catch(e => {
                    console.error(e);
                    this.fetchTCP6 = false;
                }) : '';

        // assembe ipv4 and ipv6 output
        const output = `
        ${outputv4}
        ${outputv6}
        `;

        // parse
        const regex = /:\s(.*):(.*)\s[0-9].*\s0A\s/gm;
        const ports = [];
        let matcher;
        while ((matcher = regex.exec(output)) !== null) {
            const ipRaw = matcher[1];
            const portRaw = matcher[2];
            const interfaceListen = ipConverter.convert(ipRaw);
            // convert port which is in HEX to int
            const portNumber = parseInt(portRaw, 16);
            const port: Port = { portNumber, interfaceListen };
            ports.push(port);
        }
        return ports;
    }
}
