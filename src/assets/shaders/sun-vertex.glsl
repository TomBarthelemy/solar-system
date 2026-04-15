uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;

varying float intensity;
varying float vNoise;

float hash(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p.xyz, p.yzx + 19.19);
  return fract(p.x * p.y * p.z);
}

float smoothNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i),              hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)),  hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)),  hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)),  hash(i+vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  vec3 vNormal = normalize(normalMatrix * normal);
  vec3 vNormel = normalize(normalMatrix * viewVector);
  // Rim glow: 1 at edges, 0 at center — abs() makes it BackSide-safe
  float fresnel = 1.0 - abs(dot(vNormal, vNormel));
  intensity = pow(fresnel, p);

  vec3 dir = normalize(position);

  // 4 octaves — fast churning plasma, like nuclear fusion
  float t = uTime;
  float n  = smoothNoise(dir * 1.4 + vec3( t*0.26,  t*0.18,  t*0.14)) * 0.500;
        n += smoothNoise(dir * 2.8 + vec3(-t*0.42,  t*0.30,  t*0.22) + 7.30) * 0.320;
        n += smoothNoise(dir * 5.5 + vec3( t*0.64, -t*0.48,  t*0.38) - 3.14) * 0.130;
        n += smoothNoise(dir *11.0 + vec3(-t*0.92,  t*0.72, -t*0.56) + 5.77) * 0.030;
  // Smooth remap: gentle positive bias for soft protrusions
  vNoise = clamp(n * 2.1 - 0.85, -1.0, 1.0);

  // Radial displacement: barely exits the surface, stays flush
  vec3 displaced = position * (1.0 + 0.012 * vNoise);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}