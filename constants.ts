import { Topic, Twist } from './types.ts';

export const DEFAULT_ROS_IP = '192.168.1.100';
export const CMD_VEL_TOPIC = '/cmd_vel';

export const AVAILABLE_TOPICS: Omit<Topic, 'data'>[] = [
    { name: '/odom', type: 'nav_msgs/Odometry' },
    { name: '/scan', type: 'sensor_msgs/LaserScan' },
    { name: '/status', type: 'std_msgs/String' },
    { name: '/battery_level', type: 'std_msgs/Float32' },
];

export const ZERO_TWIST: Twist = {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
};