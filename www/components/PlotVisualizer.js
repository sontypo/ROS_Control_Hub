import React, { useState, useEffect, useRef } from 'react';

// Helper to get a nested value from an object using a string path like 'a.b[0].c'
const getValueByPath = (obj, path) => {
    try {
        return path.split(/[.[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
    } catch (e) {
        return undefined;
    }
};

// Helper to recursively find all numeric fields in a message
const findNumericFields = (obj, prefix = '') => {
    let fields = [];
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


const MAX_DATA_POINTS = 50; // Keep the chart responsive
const COLORS = ['#34d399', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#f472b6'];

const PlotVisualizer = ({ rosService, topicName }) => {
    const [plottableFields, setPlottableFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const hasReceivedMessage = useRef(false);

    const selectedFieldsRef = useRef(selectedFields);
    useEffect(() => {
        selectedFieldsRef.current = selectedFields;
    }, [selectedFields]);

    useEffect(() => {
        hasReceivedMessage.current = false;

        const handleMessage = (msg) => {
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
                    const dataset = chart.data.datasets.find((d) => d.label === field);
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
                    animation: { duration: 0 }
                }
            });
        }
        
        if(chartInstanceRef.current) {
             const chart = chartInstanceRef.current;
             const existingLabels = chart.data.datasets.map((d) => d.label);
             chart.data.datasets = chart.data.datasets.filter((d) => selectedFields.includes(d.label));
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

    const handleFieldSelectionChange = (field) => {
        setSelectedFields(prev => 
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const plottableFieldsSection = plottableFields.length > 0 && React.createElement('div', null,
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400 mb-2" }, "Plottable Fields"),
        React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto bg-gray-900 p-2 rounded-md" },
            plottableFields.map(field => 
                React.createElement('label', { key: field, className: "flex items-center space-x-2 text-sm truncate" },
                    React.createElement('input', {
                        type: "checkbox",
                        className: "h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500",
                        checked: selectedFields.includes(field),
                        onChange: () => handleFieldSelectionChange(field)
                    }),
                    React.createElement('span', { className: "truncate", title: field }, field)
                )
            )
        )
    );

    const livePlotSection = React.createElement('div', { className: "mt-4" },
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400" }, "Live Plot"),
        React.createElement('div', { className: "mt-2 p-2 bg-gray-900 rounded-lg h-80 relative" },
            plottableFields.length > 0 ? (
                React.createElement('canvas', { ref: chartRef })
            ) : (
                React.createElement('div', { className: "flex items-center justify-center h-full text-gray-500" },
                    hasReceivedMessage.current 
                        ? 'No plottable (numeric) fields found in message.'
                        : 'Waiting for first message to discover plottable fields...'
                )
            )
        )
    );

    return React.createElement(React.Fragment, null,
        plottableFieldsSection,
        livePlotSection
    );
};

export default PlotVisualizer;