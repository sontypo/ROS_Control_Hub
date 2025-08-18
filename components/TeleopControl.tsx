import React, { useContext, useState, useCallback, useRef } from 'react';
import { RosContext } from '../App.tsx';
import { Twist } from '../types.ts';
import { CMD_VEL_TOPIC, ZERO_TWIST } from '../constants.ts';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons.tsx';

const TeleopControl: React.FC = () => {
    const { rosService } = useContext(RosContext);
    const [activeDirection, setActiveDirection] = useState<string | null>(null);
    const publishInterval = useRef<number | null>(null);

    const publishVelocity = useCallback((twist: Twist) => {
        rosService?.publish(CMD_VEL_TOPIC, twist);
    }, [rosService]);

    const startPublishing = useCallback((direction: string) => {
        if (publishInterval.current) {
            clearInterval(publishInterval.current);
        }
        
        let twist: Twist = { ...ZERO_TWIST };
        switch (direction) {
            case 'forward':
                twist = { ...ZERO_TWIST, linear: { x: 0.5, y: 0, z: 0 } };
                break;
            case 'backward':
                twist = { ...ZERO_TWIST, linear: { x: -0.5, y: 0, z: 0 } };
                break;
            case 'left':
                twist = { ...ZERO_TWIST, angular: { x: 0, y: 0, z: 1.0 } };
                break;
            case 'right':
                twist = { ...ZERO_TWIST, angular: { x: 0, y: 0, z: -1.0 } };
                break;
        }

        publishVelocity(twist); // Publish once immediately
        publishInterval.current = window.setInterval(() => publishVelocity(twist), 100);
        setActiveDirection(direction);

    }, [publishVelocity]);

    const stopPublishing = useCallback(() => {
        if (publishInterval.current) {
            clearInterval(publishInterval.current);
            publishInterval.current = null;
        }
        publishVelocity(ZERO_TWIST);
        setActiveDirection(null);
    }, [publishVelocity]);
    
    const handleMouseDown = (direction: string) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      startPublishing(direction);
    };

    const handleMouseUp = () => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      stopPublishing();
    };

    const ControlButton = ({ direction, icon, className }: { direction: string; icon: React.ReactNode, className: string }) => (
        <button
            onMouseDown={handleMouseDown(direction)}
            onMouseUp={handleMouseUp()}
            onMouseLeave={handleMouseUp()}
            onTouchStart={handleMouseDown(direction)}
            onTouchEnd={handleMouseUp()}
            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg shadow-lg transition-transform duration-150 transform active:scale-90 ${
                activeDirection === direction ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
            } ${className}`}
        >
            {icon}
        </button>
    );

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-center mb-4">Teleoperation Control</h2>
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-52 md:w-64 mx-auto">
                <div className="col-start-2 row-start-1 flex justify-center">
                    <ControlButton direction="forward" icon={<ArrowUpIcon className="w-8 h-8" />} className="rounded-t-xl" />
                </div>
                <div className="col-start-1 row-start-2 flex justify-center">
                    <ControlButton direction="left" icon={<ArrowLeftIcon className="w-8 h-8" />} className="rounded-l-xl" />
                </div>
                 <div className="col-start-2 row-start-2 flex justify-center items-center">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center font-bold text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v.01M12 8v.01M12 12v.01M12 16v.01M12 20v.01" /></svg>
                    </div>
                </div>
                <div className="col-start-3 row-start-2 flex justify-center">
                    <ControlButton direction="right" icon={<ArrowRightIcon className="w-8 h-8" />} className="rounded-r-xl" />
                </div>
                <div className="col-start-2 row-start-3 flex justify-center">
                    <ControlButton direction="backward" icon={<ArrowDownIcon className="w-8 h-8" />} className="rounded-b-xl" />
                </div>
            </div>
        </div>
    );
};

export default TeleopControl;