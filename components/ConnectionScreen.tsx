import React, { useState } from 'react';
import { ConnectionStatus } from '../types.ts';
import { DEFAULT_ROS_IP } from '../constants.ts';
import { RobotIcon } from './icons/RobotIcon.tsx';
import { SignalIcon } from './icons/SignalIcon.tsx';

interface ConnectionScreenProps {
    onConnect: (ip: string) => void;
    status: ConnectionStatus;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ onConnect, status }) => {
    const [ipAddress, setIpAddress] = useState<string>(DEFAULT_ROS_IP);

    const isConnecting = status === ConnectionStatus.CONNECTING;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnecting) {
            onConnect(ipAddress);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className={`absolute inset-0 bg-blue-500 rounded-full opacity-20 ${isConnecting ? 'animate-ping' : ''}`}></div>
                    <RobotIcon className="w-48 h-48 text-blue-400" />
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-2">ROS Control Hub</h1>
                <p className="text-lg text-gray-400 mb-8">Connect to your robot's ROS Master</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="ip-address" className="sr-only">ROS Master IP Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SignalIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="ip-address"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-center text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-4 transition duration-300"
                                placeholder="Enter ROS Master IP"
                                disabled={isConnecting}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isConnecting}
                        className={`w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white transition duration-300
                            ${isConnecting
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500'
                            }`}
                    >
                        {isConnecting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : (
                            'Connect'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConnectionScreen;