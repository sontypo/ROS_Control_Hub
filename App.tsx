
import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionStatus, Topic } from './types';
import { RosService } from './services/RosService';
import ConnectionManager from './components/ConnectionManager';
import TeleopControl from './components/TeleopControl';
import TopicVisualizer from './components/TopicVisualizer';
import TopicPublisher from './components/TopicPublisher';
import CommandControl from './components/CommandControl';

const App: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [rosUrl, setRosUrl] = useState<string>('ws://192.168.1.100:9090');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [activeTab, setActiveTab] = useState('control');

    const rosService = RosService.getInstance();

    const handleConnect = useCallback(() => {
        if (connectionStatus === ConnectionStatus.DISCONNECTED || connectionStatus === ConnectionStatus.ERROR) {
            setConnectionStatus(ConnectionStatus.CONNECTING);
            rosService.connect(rosUrl, 
                () => { // onConnect
                    setConnectionStatus(ConnectionStatus.CONNECTED);
                    rosService.getTopics((fetchedTopics) => {
                        setTopics(fetchedTopics);
                    });
                },
                () => { // onError
                    setConnectionStatus(ConnectionStatus.ERROR);
                },
                () => { // onClose
                    setConnectionStatus(ConnectionStatus.DISCONNECTED);
                    setTopics([]);
                }
            );
        }
    }, [connectionStatus, rosService, rosUrl]);

    const handleDisconnect = useCallback(() => {
        rosService.disconnect();
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        setTopics([]);
    }, [rosService]);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'control':
                return <TeleopControl rosService={rosService} isConnected={connectionStatus === ConnectionStatus.CONNECTED} />;
            case 'visualize':
                return <TopicVisualizer rosService={rosService} isConnected={connectionStatus === ConnectionStatus.CONNECTED} topics={topics} />;
            case 'publish':
                return <TopicPublisher rosService={rosService} isConnected={connectionStatus === ConnectionStatus.CONNECTED} topics={topics} />;
            case 'command':
                return <CommandControl rosService={rosService} isConnected={connectionStatus === ConnectionStatus.CONNECTED} />;
            default:
                return <TeleopControl rosService={rosService} isConnected={connectionStatus === ConnectionStatus.CONNECTED} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col p-4 md:p-6 lg:p-8">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-cyan-400 text-center">ROS Mobile Control Hub</h1>
                <p className="text-center text-gray-400 mt-1">Remote ROS/ROS2 Control & Visualization</p>
            </header>

            <ConnectionManager 
                status={connectionStatus}
                url={rosUrl}
                setUrl={setRosUrl}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
            />

            <main className="flex-grow mt-6">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="flex justify-center border-b border-gray-700 mb-4">
                        <TabButton title="Tele-op" icon="fa-gamepad" isActive={activeTab === 'control'} onClick={() => setActiveTab('control')} />
                        <TabButton title="Visualize" icon="fa-chart-bar" isActive={activeTab === 'visualize'} onClick={() => setActiveTab('visualize')} />
                        <TabButton title="Command" icon="fa-terminal" isActive={activeTab === 'command'} onClick={() => setActiveTab('command')} />
                        <TabButton title="Publish" icon="fa-paper-plane" isActive={activeTab === 'publish'} onClick={() => setActiveTab('publish')} />
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg shadow-xl">
                        {renderActiveTab()}
                    </div>
                </div>
            </main>

            <footer className="text-center text-gray-500 mt-8 text-sm">
                <p>Built for the modern robotics enthusiast.</p>
            </footer>
        </div>
    );
};

interface TabButtonProps {
    title: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, icon, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 px-2 text-center text-sm sm:text-base font-medium transition-all duration-300 ease-in-out border-b-2 ${
            isActive 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-gray-400 hover:text-cyan-300 hover:border-cyan-300'
        }`}
    >
        <i className={`fas ${icon} mr-2`}></i>{title}
    </button>
);


export default App;