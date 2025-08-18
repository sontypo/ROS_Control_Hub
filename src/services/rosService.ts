import * as ROSLIB from 'roslib';
import { CMD_VEL_TOPIC, MESSAGE_TYPES } from '../constants';
import { RosMessage, Topic, RosVersion } from '../types';

type SubscriptionCallback = (data: RosMessage) => void;

export class RosService {
    private ros: ROSLIB.Ros | null = null;
    private subscriptions: Map<string, ROSLIB.Topic> = new Map();
    private rosVersion: RosVersion;

    constructor(version: RosVersion) {
        this.rosVersion = version;
    }

    connect(ip: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ros && this.ros.isConnected) {
                this.ros.close();
            }

            this.ros = new ROSLIB.Ros({
                url: `ws://${ip}:9090`,
            });

            this.ros.on('connection', () => {
                console.log(`Connected to websocket server for ${this.rosVersion}.`);
                resolve();
            });

            this.ros.on('error', (error) => {
                console.error('Error connecting to websocket server: ', error);
                reject(error);
            });

            this.ros.on('close', () => {
                console.log('Connection to websocket server closed.');
                this.subscriptions.clear();
            });
        });
    }

    disconnect(): void {
        if (this.ros) {
            this.subscriptions.forEach(listener => listener.unsubscribe());
            this.subscriptions.clear();
            this.ros.close();
        }
    }

    getAvailableTopics(): Promise<Omit<Topic, 'data'>[]> {
        return new Promise((resolve, reject) => {
            if (!this.ros) {
                return reject("Not connected");
            }
            this.ros.getTopics((topicList: { topics: string[], types: string[] }) => {
                const topics = topicList.topics.map((name, index) => ({
                    name,
                    type: topicList.types[index],
                }));
                resolve(topics);
            }, (error) => {
                console.error("Failed to get topics:", error);
                reject(error);
            });
        });
    }

    subscribe(topicName: string, messageType: string, callback: SubscriptionCallback): void {
        if (!this.ros || this.subscriptions.has(topicName)) return;

        const listener = new ROSLIB.Topic({
            ros: this.ros,
            name: topicName,
            messageType: messageType,
            throttle_rate: 100,
        });

        listener.subscribe((message) => {
            callback(message as RosMessage);
        });

        this.subscriptions.set(topicName, listener);
        console.log(`Subscribed to ${topicName} (${messageType})`);
    }

    unsubscribe(topicName: string): void {
        const listener = this.subscriptions.get(topicName);
        if (listener) {
            listener.unsubscribe();
            this.subscriptions.delete(topicName);
            console.log(`Unsubscribed from ${topicName}`);
        }
    }

    publish(topicName: string, message: RosMessage, messageType?: string): void {
        if (!this.ros) return;
        
        let type = messageType;
        if (topicName === CMD_VEL_TOPIC) {
            type = MESSAGE_TYPES[this.rosVersion].Twist;
        } else if (!type) {
            type = MESSAGE_TYPES[this.rosVersion].String;
        }
        
        const topic = new ROSLIB.Topic({
            ros: this.ros,
            name: topicName,
            messageType: type,
        });

        const rosMessage = new ROSLIB.Message(message as any);
        topic.publish(rosMessage);
    }
}
