import * as net from 'net';
import * as dgram from 'dgram';
import * as http from 'http';
import { exec } from 'child_process';

interface ServiceOptions {
    host: string;
    port?: number;
    method: 'TCP' | 'UDP' | 'GET' | 'PING';
}

interface ServiceStatus {
    host: string;
    port?: number;
    method: string;
    status: string;
    latency: string | null;
}

class HostScope {
    private services: { [key: string]: ServiceOptions } = {};

    public addService(name: string, options: ServiceOptions) {
        if (this.services[name]) {
            throw new Error(`Service with name "${name}" already exists.`);
        }

        if (!options.host || !options.method) {
            throw new Error('Host and method are required.');
        }

        if (!['TCP', 'UDP', 'GET', 'PING'].includes(options.method)) {
            throw new Error('Method must be either TCP, UDP, GET, or PING.');
        }

        this.services[name] = { ...options };
    }

    public async getStatus(name: string): Promise<ServiceStatus> {
        const service = this.services[name];
        if (!service) throw new Error(`Service ${name} does not exist.`);

        try {
            let status: string = 'Not reachable';
            let latency: string | null = null;

            const start = Date.now();

            switch (service.method) {
                case 'PING':
                    const isAlive = await this.pingHost(service.host);
                    status = isAlive ? 'Online' : 'Not reachable';
                    latency = isAlive ? `${Date.now() - start} ms` : null;
                    break;
                case 'GET':
                    const httpRes = await this.httpGet(service.host);
                    status = httpRes ? 'Online' : 'Not reachable';
                    latency = httpRes ? `${Date.now() - start} ms` : null;
                    break;
                case 'TCP':
                    const tcpRes = await this.checkTCP(service.host, service.port!);
                    status = tcpRes ? 'Online' : 'Not reachable';
                    latency = tcpRes ? `${Date.now() - start} ms` : null;
                    break;
                case 'UDP':
                    const udpRes = await this.checkUDP(service.host, service.port!);
                    status = udpRes ? 'Online' : 'Not reachable';
                    latency = udpRes ? `${Date.now() - start} ms` : null;
                    break;
                default:
                    throw new Error(`Unknown method: ${service.method}`);
            }

            return {
                host: service.host,
                port: service.port,
                method: service.method,
                status,
                latency,
            };
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error checking service ${name}: ${error.message}`);
            } else {
                console.error(`Unknown error checking service ${name}`);
            }
            return {
                host: service.host,
                port: service.port,
                method: service.method,
                status: 'Error',
                latency: null,
            };
        }
    }

    private pingHost(host: string): Promise<boolean> {
        return new Promise((resolve) => {
            const cmd = process.platform === 'win32' ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;
            exec(cmd, (error) => {
                resolve(!error);
            });
        });
    }

    private httpGet(host: string): Promise<boolean> {
        return new Promise((resolve) => {
            http.get({ host, timeout: 2000 }, (res) => {
                resolve(res.statusCode === 200);
            }).on('error', () => resolve(false));
        });
    }

    private checkTCP(host: string, port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(2000); // Timeout 2 seconds

            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });

            socket.on('error', () => resolve(false));
            socket.on('timeout', () => resolve(false));

            socket.connect(port, host);
        });
    }

    private checkUDP(host: string, port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const message = Buffer.from('ping');
            const client = dgram.createSocket('udp4');
            client.send(message, 0, message.length, port, host, (err) => {
                client.close();
                resolve(!err);
            });
        });
    }
}

export default HostScope;
