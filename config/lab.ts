export const labModes = [
  {
    id: 'flux',
    number: '01',
    name: 'Liquid chrome',
    description: 'A solid that refuses to sit still. Light, geometry, and a little controlled distortion.',
    technique: 'Procedural geometry / custom shaders',
  },
  {
    id: 'swarm',
    number: '02',
    name: 'Particle field',
    description: 'Thousands of points. One strange attraction. Move through the field and send it scattering.',
    technique: 'GPU particles / interactive forces',
  },
  {
    id: 'terrain',
    number: '03',
    name: 'Future terrain',
    description: 'A changing landscape built from a few equations. Turn up the energy and make some waves.',
    technique: 'Generative terrain / vertex displacement',
  },
] as const

export const labDefaults = {
  mode: 'flux' as const,
  energy: 0.55,
}
