export type LabMode = 'flux' | 'swarm' | 'terrain'
export type SceneStatus = 'loading' | 'ready' | 'unavailable'

export interface LabSceneProps {
  variant?: 'lab' | 'hero'
  mode?: LabMode
  energy?: number
  paused?: boolean
  allowMotion?: boolean
  burst?: number
  reset?: number
  onStatus?: (status: SceneStatus) => void
}
