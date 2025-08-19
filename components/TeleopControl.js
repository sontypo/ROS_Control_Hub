import React, { useState, useEffect, useCallback } from 'react';
import DPad from './DPad.js';
import { 
    MAX_LINEAR_VELOCITY,
    MAX_ANGULAR_VELOCITY
} from '../constants.js';

const TeleopControl = ({ rosService, isConnected }) => {
    const [twist, setTwist] = useState({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
    });
    
    // This function is now responsible for periodically sending the current twist message.
    const publishTwist = useCallback(() => {
        if(isConnected) {
            rosService.publishTwist(twist);
        }
    }, [rosService, twist, isConnected]);

    // Set up a 10Hz (100ms) interval to publish the twist message.
    useEffect(() => {
        const interval = setInterval(publishTwist, 100);
        return () => clearInterval(interval);
    }, [publishTwist]);
    
    // Resets all velocities to zero, effectively stopping the robot.
    const stopMovement = () => {
        setTwist({
            linear: { x: 0, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: 0 },
        });
    }

    // Handles changes from the linear velocity D-pad.
    // dx/dy are -1, 0, or 1, representing the direction.
    const handleLinearChange = (dx, dy) => {
        setTwist(prev => ({
            ...prev,
            linear: {
                // Directly set velocity based on D-pad input, creating joystick-like behavior.
                x: dy * MAX_LINEAR_VELOCITY, // Forward/backward
                y: dx * MAX_LINEAR_VELOCITY, // Strafe left/right
                z: 0
            }
        }));
    };
    
    // Handles changes from the angular velocity D-pad.
    const handleAngularChange = (dx, dy) => {
        setTwist(prev => ({
            ...prev,
            angular: {
                x: 0,
                y: 0,
                // The horizontal axis of the D-pad controls rotation.
                z: -dx * MAX_ANGULAR_VELOCITY
            }
        }));
    };

    if (!isConnected) {
        return React.createElement('div', { className: "text-center text-gray-500 py-10" }, "Connect to a ROS system to enable teleoperation controls.");
    }

    return React.createElement('div', { className: "flex flex-col items-center" },
        React.createElement('div', { className: "grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-900 rounded-lg w-full max-w-md" },
            React.createElement('div', { className: "text-center" },
                React.createElement('p', { className: "text-xs text-gray-400" }, "Linear X (m/s)"),
                React.createElement('p', { className: "font-mono text-cyan-400" }, twist.linear.x.toFixed(2))
            ),
            React.createElement('div', { className: "text-center" },
                React.createElement('p', { className: "text-xs text-gray-400" }, "Linear Y (m/s)"),
                React.createElement('p', { className: "font-mono text-cyan-400" }, twist.linear.y.toFixed(2))
            ),
            React.createElement('div', { className: "text-center" },
                React.createElement('p', { className: "text-xs text-gray-400" }, "Angular Z (rad/s)"),
                React.createElement('p', { className: "font-mono text-cyan-400" }, twist.angular.z.toFixed(2))
            )
        ),
        React.createElement('div', { className: "flex flex-col sm:flex-row justify-around items-center w-full p-4 gap-8" },
            React.createElement('div', { className: "text-center" },
                React.createElement('h3', { className: "font-bold text-lg mb-2" }, "Linear Velocity"),
                React.createElement(DPad, { onDirectionChange: handleLinearChange })
            ),
            React.createElement('div', { className: "text-center" },
                React.createElement('h3', { className: "font-bold text-lg mb-2" }, "Angular Velocity"),
                React.createElement(DPad, { onDirectionChange: handleAngularChange })
            )
        ),
        React.createElement('button', {
            onClick: stopMovement,
            className: "mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg"
        },
            React.createElement('i', { className: "fas fa-stop-circle mr-2" }), "EMERGENCY STOP"
        )
    );
};

export default TeleopControl;