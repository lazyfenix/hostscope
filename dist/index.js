"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const dgram = __importStar(require("dgram"));
const http = __importStar(require("http"));
const child_process_1 = require("child_process");
class HostScope {
    constructor() {
        this.services = {};
    }
    addService(name, options) {
        if (this.services[name]) {
            throw new Error(`Service with name "${name}" already exists.`);
        }
        if (!options.host || !options.method) {
            throw new Error('Host and method are required.');
        }
        if (!['TCP', 'UDP', 'GET', 'PING'].includes(options.method)) {
            throw new Error('Method must be either TCP, UDP, GET, or PING.');
        }
        this.services[name] = Object.assign({}, options);
    }
    getStatus(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services[name];
            if (!service)
                throw new Error(`Service ${name} does not exist.`);
            try {
                let status = 'Not reachable';
                let latency = null;
                const start = Date.now();
                switch (service.method) {
                    case 'PING':
                        const isAlive = yield this.pingHost(service.host);
                        status = isAlive ? 'Online' : 'Not reachable';
                        latency = isAlive ? `${Date.now() - start} ms` : null;
                        break;
                    case 'GET':
                        const httpRes = yield this.httpGet(service.host);
                        status = httpRes ? 'Online' : 'Not reachable';
                        latency = httpRes ? `${Date.now() - start} ms` : null;
                        break;
                    case 'TCP':
                        const tcpRes = yield this.checkTCP(service.host, service.port);
                        status = tcpRes ? 'Online' : 'Not reachable';
                        latency = tcpRes ? `${Date.now() - start} ms` : null;
                        break;
                    case 'UDP':
                        const udpRes = yield this.checkUDP(service.host, service.port);
                        status = udpRes ? 'Online' : 'Not reachable';
                        latency = udpRes ? `${Date.now() - start} ms` : null;
                        break;
                    default:
                        throw new Error(`Unknown method: ${service.method}`);
                }
                this.outputStatus(name, {
                    host: service.host,
                    port: service.port,
                    method: service.method,
                    status,
                    latency,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error checking service ${name}: ${error.message}`);
                }
                else {
                    console.error(`Unknown error checking service ${name}`);
                }
            }
        });
    }
    pingHost(host) {
        return new Promise((resolve) => {
            const cmd = process.platform === 'win32' ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;
            (0, child_process_1.exec)(cmd, (error) => {
                resolve(!error);
            });
        });
    }
    httpGet(host) {
        return new Promise((resolve) => {
            http.get({ host, timeout: 2000 }, (res) => {
                resolve(res.statusCode === 200);
            }).on('error', () => resolve(false));
        });
    }
    checkTCP(host, port) {
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
    checkUDP(host, port) {
        return new Promise((resolve) => {
            const message = Buffer.from('ping');
            const client = dgram.createSocket('udp4');
            client.send(message, 0, message.length, port, host, (err) => {
                client.close();
                resolve(!err);
            });
        });
    }
    outputStatus(name, status) {
        console.log(JSON.stringify({ [name]: status }, null, 2));
    }
}
exports.default = HostScope;
