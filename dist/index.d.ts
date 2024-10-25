interface ServiceOptions {
    host: string;
    port?: number;
    method: 'TCP' | 'UDP' | 'GET' | 'PING';
}
declare class HostScope {
    private services;
    addService(name: string, options: ServiceOptions): void;
    getStatus(name: string): Promise<void>;
    private pingHost;
    private httpGet;
    private checkTCP;
    private checkUDP;
    private outputStatus;
}
export default HostScope;
//# sourceMappingURL=index.d.ts.map