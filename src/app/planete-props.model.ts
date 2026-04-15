import { Texture } from 'three';

/** Runtime Three.js props for a planet (textures resolved, config merged). */
export interface PlanetProps {
  scale: number;
  positionX: number;
  roughness: number;
  map: Texture;
  normalTexture: Texture;
  glowColor: string;
  // Saturn ring (optional)
  ringScale?: number;
  ringMap?: Texture;
  ringRoughness?: number;
  ringMetalness?: number;
}

/** @deprecated Use PlanetProps */
export type PlaneteProps = PlanetProps;
