import {
    SphereGeometry,
    BoxGeometry,
    TorusGeometry,
    OctahedronGeometry,
    ConeGeometry,
    CylinderGeometry,
    TetrahedronGeometry,
    IcosahedronGeometry,
    DodecahedronGeometry,
    RingGeometry,
    TorusKnotGeometry,
    type BufferGeometry,
} from "three";

// Available geometric shapes for projects
const availableGeometries: (() => BufferGeometry)[] = [
    () => new SphereGeometry(200, 32, 16),
    () => new BoxGeometry(250, 250, 250),
    () => new TorusGeometry(180, 60, 16, 100),
    () => new OctahedronGeometry(190),
    () => new ConeGeometry(190, 320, 32),
    () => new CylinderGeometry(150, 150, 280, 32),
    () => new TetrahedronGeometry(220),
    () => new IcosahedronGeometry(200),
    () => new DodecahedronGeometry(190),
    () => new TorusKnotGeometry(120, 35, 100, 16),
    () => new RingGeometry(80, 200, 32),
    () => new CylinderGeometry(190, 100, 320, 6), // Hexagonal prism
];

/**
 * Creates a geometry for a project based on its index in the projects array
 * This ensures consistent shape assignment across different components
 */
export function createProjectGeometry(projectIndex: number): BufferGeometry {
    const geometryFactory = availableGeometries[projectIndex % availableGeometries.length];
    const geometry = geometryFactory();
    
    // Ensure all geometries have bounding boxes computed
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
}

/**
 * Creates a geometry for a project based on its ID string
 * Uses a simple hash to ensure consistent shape assignment
 */
export function createProjectGeometryById(projectId: string): BufferGeometry {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
        const char = projectId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % availableGeometries.length;
    const geometryFactory = availableGeometries[index];
    const geometry = geometryFactory();
    
    // Ensure all geometries have bounding boxes computed
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
}

/**
 * Get the total number of available geometries
 */
export function getAvailableGeometryCount(): number {
    return availableGeometries.length;
} 