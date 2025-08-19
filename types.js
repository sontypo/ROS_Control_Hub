export const ConnectionStatus = {
    CONNECTED: 'CONNECTED',
    CONNECTING: 'CONNECTING',
    DISCONNECTED: 'DISCONNECTED',
    ERROR: 'ERROR'
};

// Interfaces from TypeScript (Topic, Twist) are removed as they don't exist in JavaScript.
// The application will rely on the shape of objects (duck typing).
