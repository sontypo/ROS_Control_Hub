import React from 'react';
import { Topic, Odometry, LaserScan } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TopicCardProps {
    topic: Topic;
    onUnsubscribe: (topicName: string) => void;
}

const renderData = (topic: Topic) => {
    if (topic.data === undefined || topic.data === null) {
        return <div className="text-center text-gray-500">Waiting for data...</div>;
    }

    switch (topic.name) {
        case '/odom':
            const odom = topic.data as Odometry;
            return (
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold text-gray-400">Pos X:</div> <div>{odom.pose.position.x.toFixed(3)}</div>
                    <div className="font-semibold text-gray-400">Pos Y:</div> <div>{odom.pose.position.y.toFixed(3)}</div>
                    <div className="font-semibold text-gray-400">Lin Vel:</div> <div>{odom.twist.linear.x.toFixed(3)}</div>
                    <div className="font-semibold text-gray-400">Ang Vel:</div> <div>{odom.twist.angular.z.toFixed(3)}</div>
                </div>
            );
        case '/scan':
            const scan = topic.data as LaserScan;
            const chartData = scan.ranges.map((range, index) => ({
                angle: index,
                distance: range > 100 ? null : range,
            })).filter((_, i) => i % 5 === 0); // Downsample for performance

            return (
                <div className="h-48 -mx-4 -mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="angle" stroke="#A0AEC0" fontSize={10}/>
                            <YAxis stroke="#A0AEC0" fontSize={10} domain={[0, 5]}/>
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                            <Line type="monotone" dataKey="distance" stroke="#4299E1" strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
         case '/battery_level':
            const batteryMsg = topic.data as { data: number };
            const percentage = Math.max(0, Math.min(100, batteryMsg.data || 0));
            const bgColor = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
            return (
                 <div className="space-y-2">
                    <div className="text-lg font-bold text-center">{percentage.toFixed(1)}%</div>
                    <div className="w-full bg-gray-600 rounded-full h-4">
                        <div className={`${bgColor} h-4 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            )
        case '/status':
            const statusMsg = topic.data as { data: string };
            return <p className="text-lg text-center font-mono">{statusMsg.data}</p>;
        default:
            if (typeof topic.data === 'object') {
                return <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(topic.data, null, 2)}</pre>;
            }
            return <p className="text-lg text-center font-mono">{String(topic.data)}</p>;
    }
};

const TopicCard: React.FC<TopicCardProps> = ({ topic, onUnsubscribe }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col relative min-h-[150px]">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-white">{topic.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{topic.type}</p>
                </div>
                <button
                    onClick={() => onUnsubscribe(topic.name)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors p-1"
                    aria-label="Unsubscribe"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow flex items-center justify-center">
                {renderData(topic)}
            </div>
        </div>
    );
};

export default TopicCard;