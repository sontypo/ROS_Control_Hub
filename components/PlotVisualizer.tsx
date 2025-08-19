import React, { useState, useEffect, useRef } from 'react';
import { RosService } from '../services/RosService';

declare const Chart: any;

interface PlotVisualizerProps {
    rosService: RosService;
    topicName: string;
    topicType: string;
}

const MAX_DATA_POINTS = 50; // Keep the chart responsive
const COLORS = ['#34d399', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#f472b6'];

// Helper to get a nested value from an object using a string path like 'a.b[0].c'
const getValueByPath = (obj: any, path: string) => {
    try {
        return path.split(/[.[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
    } catch (e) {
        return undefined;
    }
};

// Helper to recursively find all numeric fields in a message
const findNumericFields = (obj: any, prefix = ''): string[] => {
    let fields: string[] = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (typeof value === 'number') {
                fields.push(newPrefix);
            } else if (Array.isArray(value)) {
                // Check first few elements of an array for numbers
                for (let i = 0; i < Math.min(value.length, 10); i++) {
                    if (typeof value[i] === 'number') {
                        fields.push(`${newPrefix}[${i}]`);
                    } else if (typeof value[i] === 'object' && value[i] !== null) {
                        fields = fields.concat(findNumericFields(value[i], `${newPrefix}[${i}]`));
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                fields = fields.concat(findNumericFields(value, newPrefix));
            }
        }
    }
    return fields;
};

const PlotVisualizer: React.FC<PlotVisualizerProps> = ({ rosService, topicName }) => {
    const [plottableFields, setPlottableFields] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);
    const hasReceivedMessage = useRef<boolean>(false);
    
    // Use a ref to hold the latest selected fields to prevent the message handler
    // from causing re-renders of the subscription hook.
    const selectedFieldsRef = useRef(selectedFields);
    useEffect(() => {
        selectedFieldsRef.current = selectedFields;
    }, [selectedFields]);

    // Effect for handling subscriptions, now dependent on stable primitives.
    useEffect(() => {
        hasReceivedMessage.current = false;

        const handleMessage = (msg: any) => {
            if (!hasReceivedMessage.current) {
                hasReceivedMessage.current = true;
                const fields = findNumericFields(msg);
                setPlottableFields(fields);
                return;
            }

            if (chartInstanceRef.current && selectedFieldsRef.current.length > 0) {
                const chart = chartInstanceRef.current;
                
                chart.data.labels.push(new Date().toLocaleTimeString());
                if (chart.data.labels.length > MAX_DATA_POINTS) {
                    chart.data.labels.shift();
                }

                selectedFieldsRef.current.forEach(field => {
                    const dataset = chart.data.datasets.find((d: any) => d.label === field);
                    const value = getValueByPath(msg, field);
                    if (dataset && typeof value === 'number') {
                        dataset.data.push(value);
                        if (dataset.data.length > MAX_DATA_POINTS) {
                            dataset.data.shift();
                        }
                    }
                });
                chart.update('quiet');
            }
        };

        rosService.subscribe(topicName, handleMessage);
        
        return () => {
            rosService.unsubscribe(topicName);
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
            setPlottableFields([]);
            setSelectedFields([]);
        };
    }, [topicName, rosService]);

    // Effect for initializing/updating the chart itself.
    useEffect(() => {
        if (plottableFields.length > 0 && !chartInstanceRef.current && chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: { labels: [], datasets: [] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                        y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                    },
                    plugins: { legend: { labels: { color: '#e5e7eb' } } },
                    animation: { duration: 0 } // Disable animation for real-time updates
                }
            });
        }
        
        // Update datasets when selected fields change
        if(chartInstanceRef.current) {
             const chart = chartInstanceRef.current;
             const existingLabels = chart.data.datasets.map((d: any) => d.label);

             // Remove datasets that are no longer selected
             chart.data.datasets = chart.data.datasets.filter((d: any) => selectedFields.includes(d.label));

             // Add new datasets for newly selected fields
             selectedFields.forEach(field => {
                 if (!existingLabels.includes(field)) {
                     chart.data.datasets.push({
                         label: field,
                         data: [],
                         borderColor: COLORS[chart.data.datasets.length % COLORS.length],
                         tension: 0.1,
                         fill: false
                     });
                 }
             });
             chart.update();
        }

    }, [plottableFields, selectedFields]);


    const handleFieldSelectionChange = (field: string) => {
        setSelectedFields(prev => 
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    return (
        <>
            {plottableFields.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Plottable Fields</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto bg-gray-900 p-2 rounded-md">
                        {plottableFields.map(field => (
                            <label key={field} className="flex items-center space-x-2 text-sm truncate">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                    checked={selectedFields.includes(field)}
                                    onChange={() => handleFieldSelectionChange(field)}
                                />
                                <span className="truncate" title={field}>{field}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4">
                <h3 className="text-lg font-semibold text-cyan-400">Live Plot</h3>
                <div className="mt-2 p-2 bg-gray-900 rounded-lg h-80 relative">
                   {plottableFields.length > 0 ? (
                        <canvas ref={chartRef}></canvas>
                   ) : (
                       <div className="flex items-center justify-center h-full text-gray-500">
                           {hasReceivedMessage.current 
                               ? 'No plottable (numeric) fields found in message.'
                               : 'Waiting for first message to discover plottable fields...'
                           }
                       </div>
                   )}
                </div>
            </div>
        </>
    );
};

export default PlotVisualizer;