import { CMD_VEL_TOPIC, AVAILABLE_TOPICS, ZERO_TWIST } from '../constants.ts';
import { RosMessage, Twist, Odometry, LaserScan, Topic } from '../types.ts';

type SubscriptionCallback = (data: RosMessage) => void;

export class RosService {
    private isConnected: boolean = false;
    private subscriptions: Map<string, { callback: SubscriptionCallback; intervalId?: number }> = new Map();
    private robotState: { x: number; y: number; theta: number; linear_vel: number; angular_vel: number } = {
        x: 0,
        y: 0,
        theta: 0,
        linear_vel: 0,
        angular_vel: 0,
    };
    private lastCmdVel: Twist = ZERO_TWIST;
    private stateUpdateInterval: number | null = null;

    connect(ip: string): Promise<void> {
        console.log(`Connecting to ROS Master at ${ip}...`);
        return new Promise(resolve => {
            setTimeout(() => {
                this.isConnected = true;
                this.startStateUpdater();
                console.log("Connection successful.");
                resolve();
            }, 1500);
        });
    }

    disconnect(): void {
        console.log("Disconnecting from ROS Master...");
        this.isConnected = false;
        if (this.stateUpdateInterval) {
            clearInterval(this.stateUpdateInterval);
            this.stateUpdateInterval = null;
        }
        this.subscriptions.forEach(sub => {
            if (sub.intervalId) clearInterval(sub.intervalId);
        });
        this.subscriptions.clear();
        console.log("Disconnected.");
    }

    private startStateUpdater(): void {
        this.stateUpdateInterval = window.setInterval(() => {
            if (!this.isConnected) return;
            
            const dt = 0.1; // 100ms interval
            this.robotState.theta += this.lastCmdVel.angular.z * dt;
            this.robotState.x += this.lastCmdVel.linear.x * Math.cos(this.robotState.theta) * dt;
            this.robotState.y += this.lastCmdVel.linear.x * Math.sin(this.robotState.theta) * dt;
            
            this.robotState.linear_vel = this.lastCmdVel.linear.x;
            this.robotState.angular_vel = this.lastCmdVel.angular.z;

        }, 100);
    }

    getAvailableTopics(): Promise<Omit<Topic, 'data'>[]> {
        return Promise.resolve(AVAILABLE_TOPICS);
    }

    subscribe(topicName: string, callback: SubscriptionCallback): void {
        if (!this.isConnected) return;

        // Clear any existing subscription for this topic
        const existingSub = this.subscriptions.get(topicName);
        if (existingSub?.intervalId) {
            clearInterval(existingSub.intervalId);
        }

        let intervalId: number;
        switch (topicName) {
            case '/odom':
                intervalId = window.setInterval(() => {
                    const odomData: Odometry = {
                        pose: {
                            position: { x: this.robotState.x, y: this.robotState.y, z: 0 },
                            orientation: { w: Math.cos(this.robotState.theta / 2), x: 0, y: 0, z: Math.sin(this.robotState.theta / 2) }
                        },
                        twist: {
                            linear: { x: this.robotState.linear_vel, y: 0, z: 0 },
                            angular: { x: 0, y: 0, z: this.robotState.angular_vel }
                        }
                    };
                    callback(odomData);
                }, 200);
                break;
            case '/scan':
                intervalId = window.setInterval(() => {
                    const scanData: LaserScan = {
                        ranges: Array.from({ length: 360 }, () => 1.5 + Math.random() * 2 - (Math.random() > 0.95 ? 1 : 0)),
                        angle_min: -Math.PI,
                        angle_max: Math.PI,
                        angle_increment: (2 * Math.PI) / 360,
                    };
                    callback(scanData);
                }, 500);
                break;
            case '/status':
                 intervalId = window.setInterval(() => {
                    const statuses = ['All systems nominal.', 'Laser scanner offline.', 'Low battery warning.', 'Executing command.'];
                    callback(statuses[Math.floor(Math.random() * statuses.length)]);
                }, 2000);
                break;
            case '/battery_level':
                let battery = 95 + Math.random() * 5;
                 intervalId = window.setInterval(() => {
                    battery -= 0.05;
                    if(battery < 20) battery = 99;
                    callback(battery);
                }, 1000);
                break;
        }

        this.subscriptions.set(topicName, { callback, intervalId });
    }

    unsubscribe(topicName: string): void {
        const sub = this.subscriptions.get(topicName);
        if (sub?.intervalId) {
            clearInterval(sub.intervalId);
        }
        this.subscriptions.delete(topicName);
        console.log(`Unsubscribed from ${topicName}`);
    }

    publish(topicName: string, message: RosMessage): void {
        if (!this.isConnected) return;
        console.log(`Publishing to ${topicName}:`, message);
        
        if (topicName === CMD_VEL_TOPIC) {
            this.lastCmdVel = message as Twist;
        }
    }
}