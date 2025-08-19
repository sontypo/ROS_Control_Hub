
import React from 'react';
import { ConnectionStatus } from '../types';

interface ConnectionManagerProps {
    status: ConnectionStatus;
    url: string;
    setUrl: (url: string) => void;
    onConnect: () => void;
    onDisconnect: () => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ status, url, setUrl, onConnect, onDisconnect }) => {
    
    const getStatusIndicator = () => {
        switch (status) {
            case ConnectionStatus.CONNECTED:
                return <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>Connected</div>;
            case ConnectionStatus.CONNECTING:
                return <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-spin"></div>Connecting...</div>;
            case ConnectionStatus.ERROR:
                return <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Error</div>;
            case ConnectionStatus.DISCONNECTED:
            default:
                return <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>Disconnected</div>;
        }
    };

    const isConnected = status === ConnectionStatus.CONNECTED;
    const isConnecting = status === ConnectionStatus.CONNECTING;

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto font-semibold text-lg">{getStatusIndicator()}</div>
                <div className="flex-grow w-full">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., ws://192.168.1.100:9090"
                        disabled={isConnected || isConnecting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    />
                </div>
                {isConnected ? (
                    <button 
                        onClick={onDisconnect}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
                    >
                        <i className="fas fa-times mr-2"></i>Disconnect
                    </button>
                ) : (
                    <button 
                        onClick={onConnect}
                        disabled={isConnecting}
                        className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 flex items-center justify-center"
                    >
                        {isConnecting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-plug mr-2"></i>}
                        {isConnecting ? 'Connecting' : 'Connect'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConnectionManager;
