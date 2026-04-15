uniform float c;

varying float intensity;
varying float vNoise;

void main() {
  float rim = clamp(intensity, 0.0, 1.0);

  // Flame tongue mask: concentrate brightness on noise peaks (positive = protrusion)
  float nNorm = vNoise * 0.5 + 0.5;               // [0, 1]
  float flameMask = smoothstep(0.1, 0.9, nNorm); // smooth S-curve, no harsh peaks

  // Fire color gradient: yellow-white tip → solar orange → deep red base
  float t = clamp(rim * 2.2, 0.0, 1.0);
  vec3 tipColor  = vec3(1.00, 0.97, 0.65); // bright yellow-white
  vec3 midColor  = vec3(1.00, 0.45, 0.02); // vivid solar orange
  vec3 baseColor = vec3(0.85, 0.18, 0.00); // orange-red (not deep red)

  vec3 color = mix(tipColor, midColor,  smoothstep(0.0, 0.55, t));
       color = mix(color,    baseColor, smoothstep(0.55, 1.0, t));

  // Extra specular hotspot at flame tips (where noise peaks AND rim is mid-range)
  float hotspot = smoothstep(0.55, 0.9, nNorm) * smoothstep(0.6, 0.2, rim);
  color += vec3(0.5, 0.20, 0.0) * hotspot * 1.2;

  float brightness = rim * flameMask * 2.6 * clamp(c, 0.5, 1.5);
  gl_FragColor = vec4(color * brightness, 1.0);
}