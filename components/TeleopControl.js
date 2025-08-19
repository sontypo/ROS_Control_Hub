
import React, { useState, useEffect, useRef } from 'react';
import DPad from './DPad.js';
import { 
    MAX_LINEAR_VELOCITY,
    MAX_ANGULAR_VELOCITY,
    LINEAR_VELOCITY_STEP,
    ANGULAR_VELOCITY_STEP
} from '../constants.js';

const TeleopControl = ({ rosService, isConnected }) => {
    const [twist, setTwist] = useState({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
    });
    
    // Use a ref to store the target velocity from the D-Pads.
    // This prevents the main loop from re-rendering every time a button is pressed.
    const targetVelocityRef = useRef({
        linear: { x: 0, y: 0 },
        angular: { z: 0 },
    });

    // D-Pad handlers now only update the target velocity reference.
    const handleLinearChange = (dx, dy) => {
        targetVelocityRef.current.linear.y = dx * MAX_LINEAR_VELOCITY; // Strafe left/right
        targetVelocityRef.current.linear.x = dy * MAX_LINEAR_VELOCITY; // Forward/backward
    };
    
    const handleAngularChange = (dx, dy) => {
        targetVelocityRef.current.angular.z = -dx * MAX_ANGULAR_VELOCITY;
    };

    // The main update loop for acceleration/deceleration and publishing.
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isConnected) return;

            setTwist(currentTwist => {
                const target = targetVelocityRef.current;
                
                // Helper function to ramp a value towards a target by a step.
                const ramp = (current, target, step, max) => {
                    if (Math.abs(current - target) < step) {
                        return target;
                    }
                    let newVelocity = current;
                    if (current < target) {
                        newVelocity += step;
                    } else if (current > target) {
                        newVelocity -= step;
                    }
                    // Clamp the value to the maximum allowed velocity.
                    return Math.max(-max, Math.min(max, newVelocity));
                };

                const newTwist = {
                    linear: {
                        x: ramp(currentTwist.linear.x, target.linear.x, LINEAR_VELOCITY_STEP, MAX_LINEAR_VELOCITY),
                        y: ramp(currentTwist.linear.y, target.linear.y, LINEAR_VELOCITY_STEP, MAX_LINEAR_VELOCITY),
                        z: 0
                    },
                    angular: {
                        x: 0,
                        y: 0,
                        z: ramp(currentTwist.angular.z, target.angular.z, ANGULAR_VELOCITY_STEP, MAX_ANGULAR_VELOCITY)
                    }
                };

                // Publish only if the robot is moving or needs to stop.
                if (
                    newTwist.linear.x !== 0 || newTwist.linear.y !== 0 || newTwist.angular.z !== 0 ||
                    currentTwist.linear.x !== 0 || currentTwist.linear.y !== 0 || currentTwist.angular.z !== 0
                ) {
                    rosService.publishTwist(newTwist);
                }

                return newTwist;
            });
        }, 100); // Loop runs at 10Hz

        return () => clearInterval(interval);
    }, [isConnected, rosService]); // This effect has stable dependencies.

    // Stop resets both the target and the current velocity immediately.
    const stopMovement = () => {
        targetVelocityRef.current = {
            linear: { x: 0, y: 0 },
            angular: { z: 0 },
        };
        const zeroTwist = {
            linear: { x: 0, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: 0 },
        };
        setTwist(zeroTwist);
        if (isConnected) {
            rosService.publishTwist(zeroTwist);
        }
    }

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

