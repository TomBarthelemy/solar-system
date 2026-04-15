/**
 * Visual / Three.js scene configuration for each planet.
 * Contains only raw values (numbers, strings, texture filenames).
 * Display text lives in planet-display-data.ts.
 * The component resolves texture filenames to THREE.Texture instances.
 */

export const PLANET_ORDER = [
  'SUN', 'MERCURE', 'VENUS', 'EARTH', 'MARS',
  'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE',
] as const;

export type PlanetKey = typeof PLANET_ORDER[number];

export interface PlanetRawConfig {
  /** Three.js sphere radius */
  scale: number;
  /** Local X offset from scene origin (desktop layout) */
  positionX: number;
  roughness: number;
  glowColor: string;
  /** Filename under /assets/textures/color/ */
  colorTexture: string;
  /** Filename under /assets/textures/normal/ */
  normalTexture: string;
  ring?: {
    scale: number;
    /** Filename under /assets/textures/color/ */
    colorTexture: string;
    roughness: number;
    metalness: number;
  };
}

export const PLANET_SCENE_CONFIGS: Record<PlanetKey, PlanetRawConfig> = {
  SUN: {
    scale: 20, positionX: -30, roughness: 1,
    glowColor: '#ffff00',
    colorTexture: 'sun.jpg',
    normalTexture: 'sun-normal.jpg',
  },
  MERCURE: {
    scale: 0.9, positionX: -5, roughness: 0.4,
    glowColor: '#ae9a76',
    colorTexture: 'mercure.jpg',
    normalTexture: 'normal.jpg',
  },
  VENUS: {
    scale: 1.4, positionX: -1, roughness: 0.6,
    glowColor: '#dcb67c',
    colorTexture: 'venus.png',
    normalTexture: 'normal.jpg',
  },
  EARTH: {
    scale: 1.5, positionX: 4, roughness: 0.6,
    glowColor: '#5e6daa',
    colorTexture: 'earth.png',
    normalTexture: 'normal.jpg',
  },
  MARS: {
    scale: 0.8, positionX: 8, roughness: 0.7,
    glowColor: '#e3683e',
    colorTexture: 'mars.jpg',
    normalTexture: 'normal.jpg',
  },
  JUPITER: {
    scale: 3.0, positionX: 14, roughness: 0.8,
    glowColor: '#eecbaa',
    colorTexture: 'jupiter.jpg',
    normalTexture: 'jupiter-normal.jpg',
  },
  SATURN: {
    scale: 1.8, positionX: 23, roughness: 0.85,
    glowColor: '#ffe786',
    colorTexture: 'saturn.jpg',
    normalTexture: 'normal.jpg',
    ring: {
      scale: 0.45,
      colorTexture: 'saturn-ring.png',
      roughness: 0.4,
      metalness: 0.5,
    },
  },
  URANUS: {
    scale: 2.0, positionX: 32, roughness: 0.9,
    glowColor: '#3feee8',
    colorTexture: 'uranus.jpg',
    normalTexture: 'uranus-normal.jpg',
  },
  NEPTUNE: {
    scale: 1.8, positionX: 38, roughness: 0.9,
    glowColor: '#5b9dfb',
    colorTexture: 'neptune.jpg',
    normalTexture: 'neptune-normal.jpg',
  },
};
