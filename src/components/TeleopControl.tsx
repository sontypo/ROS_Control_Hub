import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { RosContext } from '../App';
import { Twist } from '../types';
import { CMD_VEL_TOPIC, ZERO_TWIST } from '../constants';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';

const LINEAR_VELOCITY = 0.5;
const ANGULAR_VELOCITY = 1.0;

const TeleopControl: React.FC = () => {
    const { rosService } = useContext(RosContext);
    const velocityRef = useRef<Twist>(JSON.parse(JSON.stringify(ZERO_TWIST)));
    const intervalRef = useRef<number | null>(null);
    const [activeButtons, setActiveButtons] = useState(new Set<string>());

    const publishVelocity = useCallback(() => {
        rosService?.publish(CMD_VEL_TOPIC, velocityRef.current);
    }, [rosService]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const updateVelocityState = useCallback((direction: string, start: boolean) => {
        const newActiveButtons = new Set(activeButtons);

        if (start) {
            newActiveButtons.add(direction);
        } else {
            newActiveButtons.delete(direction);
        }
        
        setActiveButtons(newActiveButtons);

        // Reset velocities before recalculating
        velocityRef.current.linear.x = 0;
        velocityRef.current.angular.z = 0;

        // Recalculate based on all currently active buttons
        if (newActiveButtons.has('forward')) {
            velocityRef.current.linear.x = LINEAR_VELOCITY;
        } else if (newActiveButtons.has('backward')) {
            velocityRef.current.linear.x = -LINEAR_VELOCITY;
        }

        if (newActiveButtons.has('left')) {
            velocityRef.current.angular.z = ANGULAR_VELOCITY;
        } else if (newActiveButtons.has('right')) {
            velocityRef.current.angular.z = -ANGULAR_VELOCITY;
        }

        // Manage publishing interval
        if (newActiveButtons.size > 0) {
            if (!intervalRef.current) {
                // Publish once immediately for responsiveness
                publishVelocity();
                intervalRef.current = window.setInterval(publishVelocity, 100);
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            // Publish one last time with zero velocity
            publishVelocity();
        }
    }, [activeButtons, publishVelocity]);

    const handleInteraction = (direction: string, start: boolean) => (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        updateVelocityState(direction, start);
    };

    const ControlButton = ({ direction, icon, className }: { direction: string; icon: React.ReactNode, className: string }) => (
        <button
            onMouseDown={handleInteraction(direction, true)}
            onMouseUp={handleInteraction(direction, false)}
            onMouseLeave={handleInteraction(direction, false)}
            onTouchStart={handleInteraction(direction, true)}
            onTouchEnd={handleInteraction(direction, false)}
            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg shadow-lg transition-transform duration-150 transform active:scale-90 ${
                activeButtons.has(direction) ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
            } ${className}`}
        >
            {icon}
        </button>
    );

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold text-center mb-4">Teleoperation Control</h2>
            <div className="flex flex-col md:flex-row justify-around items-center w-full max-w-xl mx-auto p-2 gap-4">
                
                {/* Left Stick - Linear Velocity */}
                <div className="flex flex-col items-center">
                    <span className="mb-2 text-sm font-semibold text-gray-400">Linear Velocity</span>
                    <div className="grid grid-cols-3 grid-rows-2 gap-2 w-52">
                        <div className="col-start-2 row-start-1 flex justify-center">
                            <ControlButton direction="forward" icon={<ArrowUpIcon className="w-8 h-8" />} className="" />
                        </div>
                        <div className="col-start-2 row-start-2 flex justify-center">
                            <ControlButton direction="backward" icon={<ArrowDownIcon className="w-8 h-8" />} className="" />
                        </div>
                    </div>
                </div>

                {/* Right Stick - Angular Velocity */}
                <div className="flex flex-col items-center">
                    <span className="mb-2 text-sm font-semibold text-gray-400">Angular Velocity</span>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2 w-52 items-center">
                        <div className="col-start-1 flex justify-center">
                            <ControlButton direction="left" icon={<ArrowLeftIcon className="w-8 h-8" />} className="" />
                        </div>
                        <div className="col-start-2 flex justify-center">
                            <ControlButton direction="right" icon={<ArrowRightIcon className="w-8 h-8" />} className="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeleopControl;