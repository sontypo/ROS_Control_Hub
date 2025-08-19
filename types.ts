
export enum ConnectionStatus {
    CONNECTED = 'CONNECTED',
    CONNECTING = 'CONNECTING',
    DISCONNECTED = 'DISCONNECTED',
    ERROR = 'ERROR'
}

export interface Topic {
    name: string;
    type: string;
}

export interface Twist {
    linear: {
        x: number;
        y: number;
        z: number;
    };
    angular: {
        x: number;
        y: number;
        z: number;
    };
}
