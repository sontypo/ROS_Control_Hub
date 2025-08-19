import React, { useState } from 'react';
import { SENSOR_MSGS_COMPRESSED_IMAGE, SENSOR_MSGS_IMAGE, SENSOR_MSGS_POINTCLOUD2 } from '../constants.js';
import PlotVisualizer from './PlotVisualizer.js';
import ImageVisualizer from './ImageVisualizer.js';
import PointCloudVisualizer from './PointCloudVisualizer.js';

const TopicVisualizer = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);

    const handleTopicChange = (e) => {
        const topicName = e.target.value;
        const topic = topics.find(t => t.name === topicName) || null;
        setSelectedTopic(topic);
    };

    const renderVisualizer = () => {
        if (!selectedTopic) {
            return React.createElement('div', { className: "flex items-center justify-center h-80 text-gray-500" },
                "Select a topic to begin visualization."
            );
        }

        // Use the topic name as a key to force re-mounting on topic change.
        // This ensures a clean state for each visualizer.
        const key = selectedTopic.name;
        const topicName = selectedTopic.name;
        const topicType = selectedTopic.type;

        switch (topicType) {
            case SENSOR_MSGS_COMPRESSED_IMAGE:
            case SENSOR_MSGS_IMAGE: // Handle both, though Compressed is more web-friendly
                return React.createElement(ImageVisualizer, { key: key, rosService: rosService, topicName: topicName, topicType: topicType });

            case SENSOR_MSGS_POINTCLOUD2:
                return React.createElement(PointCloudVisualizer, { key: key, rosService: rosService, topicName: topicName, topicType: topicType });

            default:
                return React.createElement(PlotVisualizer, { key: key, rosService: rosService, topicName: topicName, topicType: topicType });
        }
    };

    if (!isConnected) {
        return React.createElement('div', { className: "text-center text-gray-500 py-10" }, "Connect to a ROS system to visualize topics.");
    }

    return React.createElement('div', { className: "flex flex-col gap-4" },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "topic-select", className: "block text-sm font-medium text-gray-300 mb-1" }, "Select Topic"),
            React.createElement('select', { 
                    id: "topic-select", 
                    value: selectedTopic?.name || '', 
                    onChange: handleTopicChange, 
                    className: "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                },
                React.createElement('option', { value: "" }, "-- Select a Topic --"),
                topics.map(topic => (
                    React.createElement('option', { key: topic.name, value: topic.name }, `${topic.name} (${topic.type})`)
                ))
            )
        ),
        React.createElement('div', { className: "mt-4" },
            renderVisualizer()
        )
    );
};

export default TopicVisualizer;