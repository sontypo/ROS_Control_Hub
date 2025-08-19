import React, { useState } from 'react';

const TopicPublisher = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [messageContent, setMessageContent] = useState('{}');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePublish = () => {
        setError('');
        setSuccess('');

        if (!selectedTopic) {
            setError('Please select a topic.');
            return;
        }

        let parsedMessage;
        try {
            parsedMessage = JSON.parse(messageContent);
        } catch (e) {
            setError('Invalid JSON format.');
            return;
        }
        
        const topicInfo = topics.find(t => t.name === selectedTopic);
        if (topicInfo) {
            rosService.publish(topicInfo.name, topicInfo.type, parsedMessage);
            setSuccess(`Message published to ${topicInfo.name} successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        } else {
             setError('Could not find topic info.');
        }
    };
    
    if (!isConnected) {
        return React.createElement('div', { className: "text-center text-gray-500 py-10" }, "Connect to a ROS system to publish to topics.");
    }

    return React.createElement('div', { className: "flex flex-col gap-4" },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "topic-publish-select", className: "block text-sm font-medium text-gray-300 mb-1" },
                "Select Topic to Publish To"
            ),
            React.createElement('select', {
                    id: "topic-publish-select",
                    value: selectedTopic,
                    onChange: (e) => setSelectedTopic(e.target.value),
                    className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                },
                React.createElement('option', { value: "" }, "-- Select a Topic --"),
                topics.map(topic => (
                    React.createElement('option', { key: topic.name, value: topic.name },
                        `${topic.name} (${topic.type})`
                    )
                ))
            )
        ),
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "message-content", className: "block text-sm font-medium text-gray-300 mb-1" },
                "Message Content (JSON)"
            ),
            React.createElement('textarea', {
                id: "message-content",
                rows: 8,
                value: messageContent,
                onChange: (e) => setMessageContent(e.target.value),
                className: "w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500",
                placeholder: '{ "data": "hello world" }'
            })
        ),
        error && React.createElement('p', { className: "text-red-400 text-sm" }, error),
        success && React.createElement('p', { className: "text-green-400 text-sm" }, success),
        React.createElement('button', {
                onClick: handlePublish,
                disabled: !selectedTopic,
                className: "w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            },
            React.createElement('i', { className: "fas fa-paper-plane mr-2" }), "Publish Message"
        )
    );
};

export default TopicPublisher;
