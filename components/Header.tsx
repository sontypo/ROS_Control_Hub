import React from 'react';
import { RobotIcon } from './icons/RobotIcon.tsx';
import { SignalIcon } from './icons/SignalIcon.tsx';

interface HeaderProps {
    onDisconnect: () => void;
    onPublish: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDisconnect, onPublish }) => {
    return (
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-sm shadow-md shadow-black/20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <RobotIcon className="w-8 h-8 text-blue-400" />
                    <h1 className="text-xl font-bold text-white">Control Hub</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                        <SignalIcon className="w-4 h-4" />
                        <span>Connected</span>
                    </div>
                    <button onClick={onPublish} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                        Publish
                    </button>
                    <button onClick={onDisconnect} className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                        Disconnect
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;