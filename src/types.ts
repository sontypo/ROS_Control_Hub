export enum ConnectionStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
}

export type RosVersion = 'ros1' | 'ros2';

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Twist {
    linear: Vector3;
    angular: Vector3;
}

export interface Odometry {
    pose: {
        position: Vector3;
        orientation: { w: number; x: number; y: number; z: number };
    };
    twist: {
        linear: Vector3;
        angular: Vector3;
    };
}

export interface LaserScan {
    ranges: number[];
    angle_min: number;
    angle_max: number;
    angle_increment: number;
}

export type RosMessage = Twist | Odometry | LaserScan | string | number | boolean | { [key: string]: any };

export interface Topic {
    name: string;
    type: string;
    data?: RosMessage;
}
