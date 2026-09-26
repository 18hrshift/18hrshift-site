export const sculptureVertex = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uBurst;
  uniform vec2 uPointer;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float wave = sin(p.y * 3.6 + uTime * 0.8) * cos(p.x * 2.4 - uTime * 0.5);
    p += normal * (wave * (0.025 + uEnergy * 0.18) + uBurst * 0.3);
    p.x += sin(p.y * 1.8 + uTime * 0.4) * uEnergy * 0.13;
    p.xy += uPointer * sin(p.z * 1.7) * 0.08;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vPosition = viewPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewPosition;
  }
`

export const sculptureFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uBlue;
  uniform vec3 uInk;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    vec3 view = normalize(-vPosition);
    vec3 reflected = reflect(-view, n);
    float fresnel = pow(1.0 - max(dot(n, view), 0.0), 2.3);
    float key = pow(max(dot(n, normalize(vec3(-0.6, 1.0, 0.8))), 0.0), 1.4);
    float stripe = smoothstep(0.08, 0.16, abs(sin(reflected.y * 4.3 + reflected.x * 1.8)));
    vec3 chrome = mix(uInk * 0.025, uInk * 0.8, stripe * (key * 0.75 + 0.12));
    float limeBand = smoothstep(0.1, 0.75, reflected.x * 0.6 + reflected.y * 0.7 + 0.4);
    chrome = mix(chrome, uAccent * (0.12 + key * 0.9), limeBand * 0.8);
    chrome += uBlue * pow(max(reflected.z * 0.5 - reflected.y * 0.5, 0.0), 5.0) * 0.5;
    float softbox = pow(max(dot(reflected, normalize(vec3(-0.5, 0.8, 1.0))), 0.0), 26.0);
    chrome += uInk * softbox * 1.25;
    chrome += uAccent * fresnel * 0.3;
    float seams = smoothstep(0.46, 0.5, abs(fract(vUv.x * 110.0) - 0.5));
    chrome *= 1.0 - seams * 0.08;
    gl_FragColor = vec4(chrome, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export const particlesVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uBurst;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vSeed = aSeed;
    vec3 p = position;
    float angle = uTime * (0.08 + aSeed * 0.1) + p.y * (0.45 + uEnergy * 0.65);
    p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    float wave = sin(p.y * 4.0 + uTime + aSeed * 8.0) * 0.18 * uEnergy;
    p *= 1.0 + wave + uBurst * (0.25 + aSeed * 0.75);
    vec2 delta = p.xy - uPointer * 2.8;
    float force = exp(-dot(delta, delta) * 1.3);
    p.xy += normalize(delta + vec2(0.001)) * force * (0.35 + uEnergy * 0.6);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = clamp((mv.z + 8.0) / 6.0, 0.25, 1.0);
    gl_PointSize = (2.1 + aSeed * 2.0) * uPixelRatio * (5.5 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

export const particlesFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uBlue;
  uniform vec3 uInk;
  varying float vSeed;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 color = mix(uAccent, uBlue, smoothstep(0.3, 0.8, vSeed));
    color = mix(color, uInk, step(0.9, vSeed));
    gl_FragColor = vec4(color, (1.0 - smoothstep(0.15, 0.5, d)) * (0.55 + vDepth * 0.45));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export const terrainVertex = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uBurst;
  uniform vec2 uPointer;
  varying float vHeight;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vec3 p = position;
    vUv = uv;
    float t = uTime * 0.36;
    float ridge = sin(p.x * 1.2 + t) * cos(p.y * 1.05 - t * 0.5);
    ridge += sin(p.x * 2.4 + p.y * 1.7 - t) * 0.28;
    ridge += cos(p.y * 3.2 + t * 1.2) * 0.15;
    float distanceToPointer = length(p.xy - uPointer * 4.0);
    ridge += sin(distanceToPointer * 3.5 - t * 4.0) * exp(-distanceToPointer * 0.3) * uBurst;
    p.z = ridge * (0.3 + uEnergy * 1.1);
    vHeight = p.z;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vPosition = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

export const terrainFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uBlue;
  varying float vHeight;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vec2 coord = vUv * vec2(72.0, 60.0);
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);
    float edge = smoothstep(0.0, 0.13, vUv.x) * smoothstep(0.0, 0.13, 1.0 - vUv.x);
    edge *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(0.0, 0.1, 1.0 - vUv.y);
    vec3 color = mix(uBlue, uAccent, smoothstep(-0.3, 0.75, vHeight));
    float contour = 1.0 - smoothstep(0.02, 0.06, abs(fract(vHeight * 3.0) - 0.5));
    float alpha = (line * 0.8 + contour * 0.3 + 0.025) * edge;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`
