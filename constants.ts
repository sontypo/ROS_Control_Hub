export const CMD_VEL_TOPIC = '/cmd_vel';
export const GEOMETRY_MSGS_TWIST = 'geometry_msgs/Twist';

export const LINEAR_VELOCITY_STEP = 0.025;
export const ANGULAR_VELOCITY_STEP = 0.05;

export const MAX_LINEAR_VELOCITY = 1.0;
export const MAX_ANGULAR_VELOCITY = 2.0;

export const COMMANDABLE_MESSAGE_TYPES = [
    'std_msgs/String',
    'std_msgs/Bool',
    'std_msgs/Empty'
];

// Message types for specialized visualizers
export const SENSOR_MSGS_COMPRESSED_IMAGE = 'sensor_msgs/CompressedImage';
export const SENSOR_MSGS_IMAGE = 'sensor_msgs/Image'; // Often used with web_video_server
export const SENSOR_MSGS_POINTCLOUD2 = 'sensor_msgs/PointCloud2';
