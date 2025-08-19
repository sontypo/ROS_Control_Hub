import React, { useState } from 'react';
import { RosService } from '../services/RosService';
import { Topic } from '../types';
import { SENSOR_MSGS_COMPRESSED_IMAGE, SENSOR_MSGS_IMAGE, SENSOR_MSGS_POINTCLOUD2 } from '../constants';
import PlotVisualizer from './PlotVisualizer';
import ImageVisualizer from './ImageVisualizer';
import PointCloudVisualizer from './PointCloudVisualizer';

interface TopicVisualizerProps {
    rosService: RosService;
    isConnected: boolean;
    topics: Topic[];
}

const TopicVisualizer: React.FC<TopicVisualizerProps> = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const topicName = e.target.value;
        const topic = topics.find(t => t.name === topicName) || null;
        setSelectedTopic(topic);
    };

    const renderVisualizer = () => {
        if (!selectedTopic) {
            return (
                <div className="flex items-center justify-center h-80 text-gray-500">
                    Select a topic to begin visualization.
                </div>
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
                return <ImageVisualizer key={key} rosService={rosService} topicName={topicName} topicType={topicType} />;

            case SENSOR_MSGS_POINTCLOUD2:
                return <PointCloudVisualizer key={key} rosService={rosService} topicName={topicName} topicType={topicType} />;

            default:
                return <PlotVisualizer key={key} rosService={rosService} topicName={topicName} topicType={topicType} />;
        }
    };

    if (!isConnected) {
        return <div className="text-center text-gray-500 py-10">Connect to a ROS system to visualize topics.</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="topic-select" className="block text-sm font-medium text-gray-300 mb-1">Select Topic</label>
                <select 
                    id="topic-select" 
                    value={selectedTopic?.name || ''} 
                    onChange={handleTopicChange} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="">-- Select a Topic --</option>
                    {topics.map(topic => (
                        <option key={topic.name} value={topic.name}>{topic.name} ({topic.type})</option>
                    ))}
                </select>
            </div>
            
            <div className="mt-4">
                {renderVisualizer()}
            </div>
        </div>
    );
};

export default TopicVisualizer;