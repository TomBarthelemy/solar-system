uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform vec2 uFrequency;
uniform float uTime;

varying float intensity;
void main() 
{
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * viewVector );
    intensity = pow( c - dot(vNormal, vNormel), p );
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.5;
    modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.5;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;

}