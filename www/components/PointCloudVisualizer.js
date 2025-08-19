import React, { useEffect, useRef, useCallback } from 'react';

const PointCloudVisualizer = ({ rosService, topicName }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const pointsRef = useRef(null);

    // Initialize the 3D scene
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111827); // bg-gray-900
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.set(0, -5, 5); // Position camera to look at the point cloud
        camera.up.set(0, 0, 1); // Z-up coordinate system
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        // Initial empty points object
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Animation loop
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            // Simple rotation for interactivity
            if (scene) {
                scene.rotation.z += 0.005;
            }
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (mount.clientWidth > 0 && mount.clientHeight > 0) {
                camera.aspect = mount.clientWidth / mount.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mount.clientWidth, mount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (mount && renderer.domElement) {
                if(mount.contains(renderer.domElement)) {
                   mount.removeChild(renderer.domElement);
               }
           }
        };
    }, []);

    const handleMessage = useCallback((msg) => {
        if (!pointsRef.current || !msg.data) return;

        const points = pointsRef.current;
        const dataview = new DataView(ROSLIB.decodeB64(msg.data).buffer);
        const numPoints = msg.width * msg.height;
        
        const positions = new Float32Array(numPoints * 3);
        const colors = new Float32Array(numPoints * 3);

        let x_offset = -1, y_offset = -1, z_offset = -1, rgb_offset = -1;
        msg.fields.forEach((field) => {
            if (field.name === 'x') x_offset = field.offset;
            if (field.name === 'y') y_offset = field.offset;
            if (field.name === 'z') z_offset = field.offset;
            if (field.name === 'rgb' || field.name === 'rgba') rgb_offset = field.offset;
        });

        if (x_offset === -1 || y_offset === -1 || z_offset === -1) {
            console.error("PointCloud2 message missing x, y, or z fields.");
            return;
        }

        for (let i = 0; i < numPoints; i++) {
            const point_offset = i * msg.point_step;

            positions[i * 3 + 0] = dataview.getFloat32(point_offset + x_offset, !msg.is_bigendian);
            positions[i * 3 + 1] = dataview.getFloat32(point_offset + y_offset, !msg.is_bigendian);
            positions[i * 3 + 2] = dataview.getFloat32(point_offset + z_offset, !msg.is_bigendian);

            if (rgb_offset !== -1) {
                const rgb = dataview.getUint32(point_offset + rgb_offset, !msg.is_bigendian);
                colors[i * 3 + 0] = ((rgb >> 16) & 0xff) / 255.0;
                colors[i * 3 + 1] = ((rgb >> 8) & 0xff) / 255.0;
                colors[i * 3 + 2] = (rgb & 0xff) / 255.0;
            } else {
                 colors[i * 3 + 0] = 1.0;
                 colors[i * 3 + 1] = 1.0;
                 colors[i * 3 + 2] = 1.0;
            }
        }
        
        points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        points.geometry.attributes.position.needsUpdate = true;
        points.geometry.attributes.color.needsUpdate = true;
        points.geometry.computeBoundingSphere();

    }, []);

    // Subscribe to topic
    useEffect(() => {
        rosService.subscribe(topicName, handleMessage);
        return () => {
            rosService.unsubscribe(topicName);
        };
    }, [topicName, rosService, handleMessage]);

    return React.createElement('div', null,
        React.createElement('h3', { className: "text-lg font-semibold text-cyan-400 mb-2" }, "3D Point Cloud"),
        React.createElement('div', { ref: mountRef, className: "bg-gray-900 rounded-lg h-96 w-full" })
    );
};

export default PointCloudVisualizer;