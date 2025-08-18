import React, { useState, useCallback, useMemo } from 'react';
import ConnectionScreen from './components/ConnectionScreen';
import DashboardScreen from './components/DashboardScreen';
import { RosService } from './services/rosService';
import { ConnectionStatus, RosVersion } from './types';

export const RosContext = React.createContext<{ 
    rosService: RosService | null;
    rosVersion: RosVersion;
}>({ 
    rosService: null,
    rosVersion: 'ros2' // Default to ROS2
});

const App: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [rosService, setRosService] = useState<RosService | null>(null);
    const [rosVersion, setRosVersion] = useState<RosVersion>('ros2');

    const handleConnect = useCallback(async (ip: string, version: RosVersion) => {
        setConnectionStatus(ConnectionStatus.CONNECTING);
        setRosVersion(version);
        const service = new RosService(version);
        try {
            await service.connect(ip);
            setRosService(service);
            setConnectionStatus(ConnectionStatus.CONNECTED);
        } catch (error) {
            console.error("Failed to connect:", error);
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
            alert("Failed to connect to ROS Master. Make sure rosbridge is running and the IP is correct.");
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        rosService?.disconnect();
        setRosService(null);
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
    }, [rosService]);
    
    const contextValue = useMemo(() => ({ rosService, rosVersion }), [rosService, rosVersion]);

    return (
        <RosContext.Provider value={contextValue}>
            <div className="min-h-screen w-full font-sans">
                {connectionStatus !== ConnectionStatus.CONNECTED || !rosService ? (
                    <ConnectionScreen onConnect={handleConnect} status={connectionStatus} />
                ) : (
                    <DashboardScreen onDisconnect={handleDisconnect} />
                )}
            </div>
        </RosContext.Provider>
    );
};

export default App;
