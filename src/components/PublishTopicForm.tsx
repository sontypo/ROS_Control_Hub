import React, { useState, useContext } from 'react';
import { RosContext } from '../App';

interface PublishTopicFormProps {
    onClose: () => void;
}

const PublishTopicForm: React.FC<PublishTopicFormProps> = ({ onClose }) => {
    const { rosService } = useContext(RosContext);
    const [topicName, setTopicName] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!topicName.trim()) {
            setError("Topic name cannot be empty.");
            return;
        }

        try {
            const parsedMessage = JSON.parse(message);
            rosService?.publish(topicName, parsedMessage);
            onClose();
        } catch (e) {
            setError("Invalid JSON format in message.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold p-4 border-b border-gray-700">Publish to Topic</h2>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="topic-name" className="block text-sm font-medium text-gray-300 mb-1">Topic Name</label>
                            <input
                                id="topic-name"
                                type="text"
                                value={topicName}
                                onChange={(e) => setTopicName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="/example_topic"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message (JSON)</label>
                            <textarea
                                id="message"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder='{ "data": "hello world" }'
                            />
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </div>
                    <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Publish</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublishTopicForm;
