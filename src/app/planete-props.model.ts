import { Texture } from "three";

export interface PlaneteProps {
    radius: number,
    positionX: number,
    roughness: number,
    map: Texture,
    normalTexture: Texture,
    glowColor: string
}