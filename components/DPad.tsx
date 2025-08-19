
import React, { useState } from 'react';

interface DPadProps {
    onDirectionChange: (dx: number, dy: number) => void;
}

const DPadButton: React.FC<{
    direction: 'up' | 'down' | 'left' | 'right';
    onPress: () => void;
    onRelease: () => void;
}> = ({ direction, onPress, onRelease }) => {
    const iconMap = {
        up: 'fa-arrow-up',
        down: 'fa-arrow-down',
        left: 'fa-arrow-left',
        right: 'fa-arrow-right',
    };

    const positionMap = {
        up: 'col-start-2 col-end-3 row-start-1 row-end-2',
        down: 'col-start-2 col-end-3 row-start-3 row-end-4',
        left: 'col-start-1 col-end-2 row-start-2 row-end-3',
        right: 'col-start-3 col-end-4 row-start-2 row-end-3',
    };

    return (
        <div
            className={`w-16 h-16 flex items-center justify-center bg-gray-700 active:bg-cyan-500 rounded-md transition-colors duration-200 select-none cursor-pointer ${positionMap[direction]}`}
            onMouseDown={onPress}
            onMouseUp={onRelease}
            onMouseLeave={onRelease}
            onTouchStart={(e) => { e.preventDefault(); onPress(); }}
            onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
        >
            <i className={`fas ${iconMap[direction]} text-2xl text-gray-200`}></i>
        </div>
    );
};

const DPad: React.FC<DPadProps> = ({ onDirectionChange }) => {
    const [activeDirections, setActiveDirections] = useState<{ [key: string]: { dx: number, dy: number } }>({});

    // Calculates the net direction from all active buttons and informs the parent component.
    const updateParent = (dirs: { [key: string]: { dx: number, dy: number } }) => {
        let netDx = 0;
        let netDy = 0;
        for (const key in dirs) {
            netDx += dirs[key].dx;
            netDy += dirs[key].dy;
        }
        // Clamp values to ensure diagonal movement isn't faster
        onDirectionChange(Math.max(-1, Math.min(1, netDx)), Math.max(-1, Math.min(1, netDy)));
    };

    // Adds a direction to the active set when a button is pressed.
    const handlePress = (dx: number, dy: number, key: string) => {
        const newDirs = { ...activeDirections, [key]: { dx, dy } };
        setActiveDirections(newDirs);
        updateParent(newDirs);
    };

    // Removes a direction from the active set when a button is released.
    const handleRelease = (key: string) => {
        const newDirs = { ...activeDirections };
        delete newDirs[key];
        setActiveDirections(newDirs);
        updateParent(newDirs);
    };

    return (
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48">
            <DPadButton direction="up" onPress={() => handlePress(0, 1, 'up')} onRelease={() => handleRelease('up')} />
            <DPadButton direction="down" onPress={() => handlePress(0, -1, 'down')} onRelease={() => handleRelease('down')} />
            <DPadButton direction="left" onPress={() => handlePress(-1, 0, 'left')} onRelease={() => handleRelease('left')} />
            <DPadButton direction="right" onPress={() => handlePress(1, 0, 'right')} onRelease={() => handleRelease('right')} />
            <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center bg-gray-600 rounded-full">
                <i className="fas fa-arrows-alt text-gray-400"></i>
            </div>
        </div>
    );
};

export default DPad;