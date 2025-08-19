import React, { useState, useEffect, useCallback } from 'react';

const TopicVisualizer = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [message, setMessage] = useState(null);

    const handleSubscription = useCallback((topicName) => {
        if (!isConnected || !topicName) return;
        
        rosService.subscribe(topicName, (msg) => {
            setMessage(msg);
        });

    }, [isConnected, rosService]);

    useEffect(() => {
        // Cleanup subscription on component unmount or when topic changes
        return () => {
            if (selectedTopic) {
                rosService.unsubscribe(selectedTopic);
            }
        };
    }, [rosService, selectedTopic]);

    const handleTopicChange = (e) => {
        const newTopic = e.target.value;
        
        // Unsubscribe from the old topic if it exists
        if (selectedTopic) {
            rosService.unsubscribe(selectedTopic);
            setMessage(null);
        }

        setSelectedTopic(newTopic);
        
        if (newTopic) {
            handleSubscription(newTopic);
        }
    };

    if (!isConnected) {
        return React.createElement('div', { className: "text-center text-gray-500 py-10" }, "Connect to a ROS system to visualize topics.");
    }

    return React.createElement('div', { className: "flex flex-col gap-4" },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "topic-select", className: "block text-sm font-medium text-gray-300 mb-1" },
                "Select a Topic to Visualize"
            ),
            React.createElement('select', {
                    id: "topic-select",
                    value: selectedTopic,
                    onChange: handleTopicChange,
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
        React.createElement('div', { className: "mt-4" },
            React.createElement('h3', { className: "text-lg font-semibold text-cyan-400" }, "Live Data"),
            React.createElement('div', { className: "mt-2 p-4 bg-gray-900 rounded-lg h-80 overflow-auto font-mono text-sm" },
                selectedTopic ? (
                    message ? (
                        React.createElement('pre', { className: "whitespace-pre-wrap break-all" }, JSON.stringify(message, null, 2))
                    ) : (
                        React.createElement('p', { className: "text-gray-500" }, `Waiting for first message on ${selectedTopic}...`)
                    )
                ) : (
                    React.createElement('p', { className: "text-gray-500" }, "No topic selected.")
                )
            )
        )
    );
};

export default TopicVisualizer;
