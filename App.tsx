import React, { useState, useCallback, useMemo } from 'react';
import ConnectionScreen from './components/ConnectionScreen.tsx';
import DashboardScreen from './components/DashboardScreen.tsx';
import { RosService } from './services/rosService.ts';
import { ConnectionStatus } from './types.ts';

export const RosContext = React.createContext<{ rosService: RosService | null }>({ rosService: null });

const App: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [rosService, setRosService] = useState<RosService | null>(null);

    const handleConnect = useCallback(async (ip: string) => {
        setConnectionStatus(ConnectionStatus.CONNECTING);
        const service = new RosService();
        try {
            await service.connect(ip);
            setRosService(service);
            setConnectionStatus(ConnectionStatus.CONNECTED);
        } catch (error) {
            console.error("Failed to connect:", error);
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
            alert("Failed to connect to ROS Master.");
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        rosService?.disconnect();
        setRosService(null);
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
    }, [rosService]);
    
    const contextValue = useMemo(() => ({ rosService }), [rosService]);

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