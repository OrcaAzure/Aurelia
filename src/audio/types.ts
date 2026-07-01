export type AudioChannel = 'music' | 'sfx' | 'ambient'

export interface AudioClip {
  id: string
  src: string
  channel: AudioChannel
  volume: number
}

export interface AudioService {
  play(clipId: string): void
  stop(clipId: string): void
  setChannelVolume(channel: AudioChannel, volume: number): void
}
