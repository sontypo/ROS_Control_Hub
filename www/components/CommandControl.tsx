
import React, { useState } from 'react';
import { RosService } from '../services/RosService';
import { COMMANDABLE_MESSAGE_TYPES } from '../constants';

interface CommandControlProps {
    rosService: RosService;
    isConnected: boolean;
}

const CommandControl: React.FC<CommandControlProps> = ({ rosService, isConnected }) => {
    const [topicName, setTopicName] = useState<string>('');
    const [messageType, setMessageType] = useState<string>(COMMANDABLE_MESSAGE_TYPES[0]);
    const [stringValue, setStringValue] = useState<string>('');
    const [boolValue, setBoolValue] = useState<boolean>(false);
    
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleSendCommand = () => {
        setError('');
        setSuccess('');

        if (!topicName) {
            setError('Please enter a topic name.');
            return;
        }

        let message: any = {};
        switch (messageType) {
            case 'std_msgs/String':
                message = { data: stringValue };
                break;
            case 'std_msgs/Bool':
                message = { data: boolValue };
                break;
            case 'std_msgs/Empty':
                message = {};
                break;
            default:
                setError('Unsupported message type.');
                return;
        }
        
        rosService.publish(topicName, messageType, message);
        setSuccess(`Command sent to ${topicName} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const renderValueInput = () => {
        switch (messageType) {
            case 'std_msgs/String':
                return (
                    <input
                        type="text"
                        value={stringValue}
                        onChange={(e) => setStringValue(e.target.value)}
                        placeholder="Enter string value"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                );
            case 'std_msgs/Bool':
                return (
                    <div className="flex items-center justify-center bg-gray-700 rounded-md p-2">
                        <span className={`font-bold mr-3 ${!boolValue ? 'text-cyan-400' : 'text-gray-400'}`}>False</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={boolValue} onChange={() => setBoolValue(!boolValue)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                        <span className={`font-bold ml-3 ${boolValue ? 'text-cyan-400' : 'text-gray-400'}`}>True</span>
                    </div>
                );
            case 'std_msgs/Empty':
                return <p className="text-gray-500 text-center py-2">No value needed for Empty message.</p>;
            default:
                return null;
        }
    };
    
    if (!isConnected) {
        return <div className="text-center text-gray-500 py-10">Connect to a ROS system to send commands.</div>;
    }

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <div>
                <label htmlFor="command-topic-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Target Topic Name
                </label>
                <input
                    id="command-topic-name"
                    type="text"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="/example_topic"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            
            <div>
                <label htmlFor="message-type-select" className="block text-sm font-medium text-gray-300 mb-1">
                    Message Type
                </label>
                <select
                    id="message-type-select"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {COMMANDABLE_MESSAGE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Value
                </label>
                {renderValueInput()}
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <button
                onClick={handleSendCommand}
                disabled={!topicName}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed mt-2"
            >
                <i className="fas fa-rocket mr-2"></i>Send Command
            </button>
        </div>
    );
};

export default CommandControl;
