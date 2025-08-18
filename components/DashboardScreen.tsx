import React, { useState, useEffect, useContext, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { RosContext } from '../App.tsx';
import Header from './Header.tsx';
import TeleopControl from './TeleopControl.tsx';
import TopicCard from './TopicCard.tsx';
import { Topic, RosMessage } from '../types.ts';
import { AVAILABLE_TOPICS } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import PublishTopicForm from './PublishTopicForm.tsx';

const DashboardScreen: React.FC<{ onDisconnect: () => void }> = ({ onDisconnect }) => {
    const { rosService } = useContext(RosContext);
    const [subscribedTopics, setSubscribedTopics] = useState<Topic[]>([]);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    
    useEffect(() => {
        // Automatically subscribe to /odom on connect
        subscribeToTopic(AVAILABLE_TOPICS[0]);

        // Handle Android back button
        const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
                CapacitorApp.exitApp();
            } else {
                // This would be history.back() in a router context
            }
        });
      
        return () => {
             backButtonListener.then(listener => listener.remove());
             // Unsubscribe from all topics on disconnect
             subscribedTopics.forEach(topic => rosService?.unsubscribe(topic.name));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDataUpdate = useCallback((topicName: string, data: RosMessage) => {
        setSubscribedTopics(prevTopics =>
            prevTopics.map(t =>
                t.name === topicName ? { ...t, data } : t
            )
        );
    }, []);

    const subscribeToTopic = useCallback((topic: Omit<Topic, 'data'>) => {
        if (!rosService || subscribedTopics.some(st => st.name === topic.name)) {
            return;
        }
        rosService.subscribe(topic.name, (data) => handleDataUpdate(topic.name, data));
        setSubscribedTopics(prev => [...prev, { ...topic, data: undefined }]);
        setShowTopicModal(false);
    }, [rosService, subscribedTopics, handleDataUpdate]);

    const unsubscribeFromTopic = useCallback((topicName: string) => {
        rosService?.unsubscribe(topicName);
        setSubscribedTopics(prev => prev.filter(t => t.name !== topicName));
    }, [rosService]);
    
    const availableToSubscribe = AVAILABLE_TOPICS.filter(at => !subscribedTopics.some(st => st.name === at.name));

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <Header onDisconnect={onDisconnect} onPublish={() => setShowPublishModal(true)} />
            
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                <TeleopControl />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subscribedTopics.map(topic => (
                        <TopicCard key={topic.name} topic={topic} onUnsubscribe={unsubscribeFromTopic} />
                    ))}
                    <button 
                        onClick={() => setShowTopicModal(true)}
                        className="flex flex-col items-center justify-center p-4 min-h-[150px] bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-700/50 hover:border-blue-500 transition-colors duration-300">
                        <PlusIcon className="w-12 h-12 text-gray-500 mb-2" />
                        <span className="font-semibold text-gray-400">Subscribe to Topic</span>
                    </button>
                </div>
            </main>

            {showTopicModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowTopicModal(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                         <h2 className="text-xl font-bold p-4 border-b border-gray-700">Available Topics</h2>
                         <div className="p-4 max-h-60 overflow-y-auto">
                           {availableToSubscribe.length > 0 ? (
                               <ul className="space-y-2">
                                   {availableToSubscribe.map(topic => (
                                       <li key={topic.name} onClick={() => subscribeToTopic(topic)}
                                           className="p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-blue-600 transition-colors duration-200">
                                           <p className="font-semibold">{topic.name}</p>
                                           <p className="text-sm text-gray-400">{topic.type}</p>
                                       </li>
                                   ))}
                               </ul>
                           ) : (
                                <p className="text-center text-gray-400">No more topics to subscribe to.</p>
                           )}
                         </div>
                         <div className="p-2 border-t border-gray-700 text-right">
                             <button onClick={() => setShowTopicModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Close</button>
                         </div>
                    </div>
                </div>
            )}

            {showPublishModal && <PublishTopicForm onClose={() => setShowPublishModal(false)} />}

        </div>
    );
};

export default DashboardScreen;