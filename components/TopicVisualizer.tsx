
import React, { useState, useEffect, useCallback } from 'react';
import { RosService } from '../services/RosService';
import { Topic } from '../types';

interface TopicVisualizerProps {
    rosService: RosService;
    isConnected: boolean;
    topics: Topic[];
}

const TopicVisualizer: React.FC<TopicVisualizerProps> = ({ rosService, isConnected, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [message, setMessage] = useState<any>(null);

    const handleSubscription = useCallback((topicName: string) => {
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

    const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        return <div className="text-center text-gray-500 py-10">Connect to a ROS system to visualize topics.</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="topic-select" className="block text-sm font-medium text-gray-300 mb-1">
                    Select a Topic to Visualize
                </label>
                <select
                    id="topic-select"
                    value={selectedTopic}
                    onChange={handleTopicChange}
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

            <div className="mt-4">
                <h3 className="text-lg font-semibold text-cyan-400">Live Data</h3>
                <div className="mt-2 p-4 bg-gray-900 rounded-lg h-80 overflow-auto font-mono text-sm">
                    {selectedTopic ? (
                        message ? (
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(message, null, 2)}</pre>
                        ) : (
                            <p className="text-gray-500">Waiting for first message on {selectedTopic}...</p>
                        )
                    ) : (
                        <p className="text-gray-500">No topic selected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopicVisualizer;
