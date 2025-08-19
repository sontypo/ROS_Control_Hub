
import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionStatus } from './types.js';
import { RosService } from './services/RosService.js';
import ConnectionManager from './components/ConnectionManager.js';
import TeleopControl from './components/TeleopControl.js';
import TopicVisualizer from './components/TopicVisualizer.js';
import TopicPublisher from './components/TopicPublisher.js';
import CommandControl from './components/CommandControl.js';

const App = () => {
    const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
    const [rosUrl, setRosUrl] = useState('ws://192.168.1.100:9090');
    const [topics, setTopics] = useState([]);
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
                return React.createElement(TeleopControl, { rosService: rosService, isConnected: connectionStatus === ConnectionStatus.CONNECTED });
            case 'visualize':
                return React.createElement(TopicVisualizer, { rosService: rosService, isConnected: connectionStatus === ConnectionStatus.CONNECTED, topics: topics });
            case 'publish':
                return React.createElement(TopicPublisher, { rosService: rosService, isConnected: connectionStatus === ConnectionStatus.CONNECTED, topics: topics });
            case 'command':
                return React.createElement(CommandControl, { rosService: rosService, isConnected: connectionStatus === ConnectionStatus.CONNECTED });
            default:
                return React.createElement(TeleopControl, { rosService: rosService, isConnected: connectionStatus === ConnectionStatus.CONNECTED });
        }
    };
    
    return React.createElement('div', { className: "min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col p-4 md:p-6 lg:p-8" },
        React.createElement('header', { className: "mb-4" },
            React.createElement('h1', { className: "text-3xl font-bold text-cyan-400 text-center" }, "ROS Mobile Control Hub"),
            React.createElement('p', { className: "text-center text-gray-400 mt-1" }, "Remote ROS/ROS2 Control & Visualization")
        ),
        React.createElement(ConnectionManager, {
            status: connectionStatus,
            url: rosUrl,
            setUrl: setRosUrl,
            onConnect: handleConnect,
            onDisconnect: handleDisconnect
        }),
        React.createElement('main', { className: "flex-grow mt-6" },
            React.createElement('div', { className: "w-full max-w-4xl mx-auto" },
                React.createElement('div', { className: "flex justify-center border-b border-gray-700 mb-4" },
                    React.createElement(TabButton, { title: "Tele-op", icon: "fa-gamepad", isActive: activeTab === 'control', onClick: () => setActiveTab('control') }),
                    React.createElement(TabButton, { title: "Visualize", icon: "fa-chart-bar", isActive: activeTab === 'visualize', onClick: () => setActiveTab('visualize') }),
                    React.createElement(TabButton, { title: "Command", icon: "fa-terminal", isActive: activeTab === 'command', onClick: () => setActiveTab('command') }),
                    React.createElement(TabButton, { title: "Publish", icon: "fa-paper-plane", isActive: activeTab === 'publish', onClick: () => setActiveTab('publish') })
                ),
                React.createElement('div', { className: "p-4 bg-gray-800 rounded-lg shadow-xl" },
                    renderActiveTab()
                )
            )
        ),
        React.createElement('footer', { className: "text-center text-gray-500 mt-8 text-sm" },
            React.createElement('p', null, "Built for the modern robotics enthusiast.")
        )
    );
};

const TabButton = ({ title, icon, isActive, onClick }) => (
    React.createElement('button', {
        onClick: onClick,
        className: `flex-1 py-3 px-2 text-center text-sm sm:text-base font-medium transition-all duration-300 ease-in-out border-b-2 ${
            isActive 
                ? 'border-cyan-400 text-cyan-400' 
                : 'border-transparent text-gray-400 hover:text-cyan-300 hover:border-cyan-300'
        }`
    },
        React.createElement('i', { className: `fas ${icon} mr-2` }),
        title
    )
);

export default App;