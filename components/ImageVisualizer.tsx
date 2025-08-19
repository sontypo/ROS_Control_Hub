import React, { useState, useEffect, useCallback } from 'react';
import { RosService } from '../services/RosService';

interface ImageVisualizerProps {
    rosService: RosService;
    topicName: string;
    topicType: string;
}

const ImageVisualizer: React.FC<ImageVisualizerProps> = ({ rosService, topicName }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleMessage = useCallback((msg: any) => {
        // We expect a CompressedImage message, which has 'format' and 'data' (base64) fields.
        if (msg.format && msg.data) {
            const newImageUrl = `data:image/${msg.format};base64,${msg.data}`;
            setImageUrl(newImageUrl);
        } else {
            console.warn(`Received message on topic ${topicName} is not a valid CompressedImage.`, msg);
        }
    }, [topicName]);

    useEffect(() => {
        rosService.subscribe(topicName, handleMessage);
        
        return () => {
            rosService.unsubscribe(topicName);
        };
    }, [topicName, rosService, handleMessage]);

    return (
        <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Live Image Stream</h3>
            <div className="bg-gray-900 rounded-lg h-80 flex items-center justify-center">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={`Live stream from ${topicName}`}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <div className="text-gray-500">
                        Waiting for image data on {topicName}...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageVisualizer;