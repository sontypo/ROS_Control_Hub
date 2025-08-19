import { CMD_VEL_TOPIC, GEOMETRY_MSGS_TWIST } from '../constants.js';

// This class uses the ROSLIB object, which is loaded from a CDN script in index.html.

export class RosService {
    static instance;
    ros = null;
    subscriptions = new Map();
    topicCache = new Map(); // Cache for topic names to their types

    constructor() {}

    static getInstance() {
        if (!RosService.instance) {
            RosService.instance = new RosService();
        }
        return RosService.instance;
    }

    connect(url, onConnect, onError, onClose) {
        if (this.ros && this.ros.isConnected) {
            console.warn("Already connected. Disconnect first.");
            return;
        }

        this.ros = new ROSLIB.Ros({ url });

        this.ros.on('connection', () => {
            console.log('Successfully connected to ROS bridge.');
            onConnect();
        });

        this.ros.on('error', (error) => {
            console.error('Connection error:', error);
            onError(error);
            this.ros = null;
        });

        this.ros.on('close', () => {
            console.log('Connection closed.');
            this.subscriptions.clear();
            this.topicCache.clear();
            onClose();
            this.ros = null;
        });
    }

    disconnect() {
        if (this.ros) {
            this.ros.close();
            console.log('Disconnected from ROS bridge.');
        }
        this.ros = null;
        this.subscriptions.clear();
        this.topicCache.clear();
    }

    getTopics(callback) {
        if (!this.ros || !this.ros.isConnected) return;
        
        this.ros.getTopics((topicList) => {
            this.topicCache.clear();
            const topics = topicList.topics.map((name, index) => {
                const type = topicList.types[index] || 'unknown';
                this.topicCache.set(name, type);
                return { name, type };
            });
            callback(topics);
        });
    }

    subscribe(topicName, callback) {
        if (!this.ros || !this.ros.isConnected) return;

        if (this.subscriptions.has(topicName)) {
            this.unsubscribe(topicName);
        }

        const messageType = this.topicCache.get(topicName);
        if (!messageType) {
            console.error(`Cannot subscribe: Unknown message type for topic ${topicName}. Make sure getTopics has been called.`);
            return;
        }

        const listener = new ROSLIB.Topic({
            ros: this.ros,
            name: topicName,
            messageType: messageType
        });

        listener.subscribe(callback);
        this.subscriptions.set(topicName, listener);
        console.log(`Subscribing to topic: ${topicName} (${messageType})`);
    }

    unsubscribe(topicName) {
        if (this.subscriptions.has(topicName)) {
            const listener = this.subscriptions.get(topicName);
            listener.unsubscribe();
            this.subscriptions.delete(topicName);
            console.log(`Unsubscribed from topic: ${topicName}`);
        }
    }

    publish(topicName, messageType, message) {
        if (!this.ros || !this.ros.isConnected) {
            console.warn('Cannot publish, not connected.');
            return;
        }
        
        const topic = new ROSLIB.Topic({
            ros: this.ros,
            name: topicName,
            messageType: messageType
        });
        
        const rosMessage = new ROSLIB.Message(message);
        topic.publish(rosMessage);
    }
    
    publishTwist(twist) {
        this.publish(CMD_VEL_TOPIC, GEOMETRY_MSGS_TWIST, twist);
    }

    isConnected() {
        return this.ros ? this.ros.isConnected : false;
    }
}
