import { Twist, RosVersion } from './types';

export const DEFAULT_ROS_IP = '192.168.1.100';
export const CMD_VEL_TOPIC = '/cmd_vel';

export const MESSAGE_TYPES: { [key in RosVersion]: { [key: string]: string } } = {
    ros1: {
        Twist: 'geometry_msgs/Twist',
        String: 'std_msgs/String',
    },
    ros2: {
        Twist: 'geometry_msgs/msg/Twist',
        String: 'std_msgs/msg/String',
    }
};

export const ZERO_TWIST: Twist = {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
};
