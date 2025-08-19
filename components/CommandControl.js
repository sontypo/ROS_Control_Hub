
import React, { useState } from 'react';
import { COMMANDABLE_MESSAGE_TYPES } from '../constants.js';

const CommandControl = ({ rosService, isConnected }) => {
    const [topicName, setTopicName] = useState('');
    const [messageType, setMessageType] = useState(COMMANDABLE_MESSAGE_TYPES[0]);
    const [stringValue, setStringValue] = useState('');
    const [boolValue, setBoolValue] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendCommand = () => {
        setError('');
        setSuccess('');

        if (!topicName) {
            setError('Please enter a topic name.');
            return;
        }

        let message = {};
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
                return React.createElement('input', {
                    type: "text",
                    value: stringValue,
                    onChange: (e) => setStringValue(e.target.value),
                    placeholder: "Enter string value",
                    className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                });
            case 'std_msgs/Bool':
                return React.createElement('div', { className: "flex items-center justify-center bg-gray-700 rounded-md p-2" },
                    React.createElement('span', { className: `font-bold mr-3 ${!boolValue ? 'text-cyan-400' : 'text-gray-400'}` }, "False"),
                    React.createElement('label', { className: "relative inline-flex items-center cursor-pointer" },
                        React.createElement('input', { type: "checkbox", checked: boolValue, onChange: () => setBoolValue(!boolValue), className: "sr-only peer" }),
                        React.createElement('div', { className: "w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" })
                    ),
                    React.createElement('span', { className: `font-bold ml-3 ${boolValue ? 'text-cyan-400' : 'text-gray-400'}` }, "True")
                );
            case 'std_msgs/Empty':
                return React.createElement('p', { className: "text-gray-500 text-center py-2" }, "No value needed for Empty message.");
            default:
                return null;
        }
    };
    
    if (!isConnected) {
        return React.createElement('div', { className: "text-center text-gray-500 py-10" }, "Connect to a ROS system to send commands.");
    }

    return React.createElement('div', { className: "flex flex-col gap-4 max-w-lg mx-auto" },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "command-topic-name", className: "block text-sm font-medium text-gray-300 mb-1" }, "Target Topic Name"),
            React.createElement('input', {
                id: "command-topic-name",
                type: "text",
                value: topicName,
                onChange: (e) => setTopicName(e.target.value),
                placeholder: "/example_topic",
                className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            })
        ),
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "message-type-select", className: "block text-sm font-medium text-gray-300 mb-1" }, "Message Type"),
            React.createElement('select', {
                    id: "message-type-select",
                    value: messageType,
                    onChange: (e) => setMessageType(e.target.value),
                    className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                },
                COMMANDABLE_MESSAGE_TYPES.map(type => React.createElement('option', { key: type, value: type }, type))
            )
        ),
        React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-300 mb-1" }, "Value"),
            renderValueInput()
        ),
        error && React.createElement('p', { className: "text-red-400 text-sm text-center" }, error),
        success && React.createElement('p', { className: "text-green-400 text-sm text-center" }, success),
        React.createElement('button', {
                onClick: handleSendCommand,
                disabled: !topicName,
                className: "w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed mt-2"
            },
            React.createElement('i', { className: "fas fa-rocket mr-2" }), "Send Command"
        )
    );
};

export default CommandControl;
