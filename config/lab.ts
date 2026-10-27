export const labModes = [
  {
    id: 'flux',
    number: '01',
    name: 'Liquid chrome',
    description: 'A solid that refuses to sit still. Light, geometry, and a little controlled distortion.',
    technique: 'Procedural geometry / custom shaders',
    canvasLabel: 'Liquid chrome sculpture, rendered in real time',
  },
  {
    id: 'swarm',
    number: '02',
    name: 'Particle field',
    description: 'Thousands of points. One strange attraction. Move through the field and send it scattering.',
    technique: 'GPU particles / interactive forces',
    canvasLabel: 'Interactive particle sphere, rendered in real time',
  },
  {
    id: 'terrain',
    number: '03',
    name: 'Future terrain',
    description: 'A changing landscape built from a few equations. Turn up the energy and make some waves.',
    technique: 'Generative terrain / vertex displacement',
    canvasLabel: 'Procedural wireframe landscape, rendered in real time',
  },
] as const

export const labDefaults = {
  mode: 'flux' as const,
  energy: 0.55,
}

// Labels and microcopy for the lab workbench.
export const labCopy = {
  loading: 'Preparing the playground',
  experiment: '18 / EXPERIMENT',
  stageStatus: { unavailable: 'STATIC PREVIEW', loading: 'LOADING', live: 'LIVE RENDER', paused: 'PAUSED' },
  pointerHint: 'Move your cursor to influence the form',
  controlsHeading: 'MAKE IT YOURS',
  pickerLegend: 'Choose an experiment',
  energy: 'Energy',
  calm: 'CALM',
  chaos: 'CHAOS',
  burst: 'Disturb the field',
  pause: 'Pause',
  play: 'Play',
  reset: 'Reset',
  reducedMotionNote: 'Motion is paused to match your preference. Play when you’re ready.',
  motionNote: 'Made of code. Shaped by you.',
  footnote: ['THREE EXPERIMENTS. INFINITE VARIATIONS.', 'Rendered here, in your browser. No video tricks.'],
  unavailable: 'Static preview · interactive 3D is unavailable in this browser.',
} as const
