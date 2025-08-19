
import React, { useState } from 'react';
import { RosService } from '../services/RosService';
import { Topic } from '../types';

interface TopicPublisherProps {
    rosService: RosService;
    isConnected: boolean;
    topics: Topic[];
}

const TopicPublisher: React.FC<TopicPublisherProps> = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [messageContent, setMessageContent] = useState<string>('{}');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

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
        return <div className="text-center text-gray-500 py-10">Connect to a ROS system to publish to topics.</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="topic-publish-select" className="block text-sm font-medium text-gray-300 mb-1">
                    Select Topic to Publish To
                </label>
                <select
                    id="topic-publish-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="">-- Select a Topic --</option>
                    {topics.map(topic => (
                        <option key={topic.name} value={topic.name}>
                            {topic.name} ({topic.type})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="message-content" className="block text-sm font-medium text-gray-300 mb-1">
                    Message Content (JSON)
                </label>
                <textarea
                    id="message-content"
                    rows={8}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder='{ "data": "hello world" }'
                />
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
                onClick={handlePublish}
                disabled={!selectedTopic}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <i className="fas fa-paper-plane mr-2"></i>Publish Message
            </button>
        </div>
    );
};

export default TopicPublisher;
