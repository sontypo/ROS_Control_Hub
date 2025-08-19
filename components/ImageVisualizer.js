import React, { useState, useEffect, useCallback } from 'react';

const ImageVisualizer = ({ rosService, topicName }) => {
    const [imageUrl, setImageUrl] = useState(null);

    const handleMessage = useCallback((msg) => {
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

    return React.createElement('div', null,
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400 mb-2" }, "Live Image Stream"),
        React.createElement('div', { className: "bg-gray-900 rounded-lg h-80 flex items-center justify-center" },
            imageUrl ? (
                React.createElement('img', { 
                    src: imageUrl, 
                    alt: `Live stream from ${topicName}`,
                    className: "max-h-full max-w-full object-contain"
                })
            ) : (
                React.createElement('div', { className: "text-gray-500" },
                    `Waiting for image data on ${topicName}...`
                )
            )
        )
    );
};

export default ImageVisualizer;