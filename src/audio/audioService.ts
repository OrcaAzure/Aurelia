type SfxType = 'brew-success' | 'brew-fail' | 'discover' | 'draw' | 'click' | 'explore'

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
): void {
  const ctx = getContext()
  if (!ctx) {
    return
  }

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = volume
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  oscillator.stop(ctx.currentTime + duration)
}

export const audioService = {
  resume(): void {
    getContext()?.resume()
  },

  play(sfx: SfxType): void {
    switch (sfx) {
      case 'brew-success':
        playTone(440, 0.15)
        setTimeout(() => playTone(660, 0.2), 100)
        setTimeout(() => playTone(880, 0.25), 200)
        break
      case 'brew-fail':
        playTone(180, 0.3, 'sawtooth', 0.05)
        break
      case 'discover':
        playTone(523, 0.12)
        setTimeout(() => playTone(784, 0.18), 80)
        setTimeout(() => playTone(1046, 0.22), 160)
        break
      case 'draw':
        playTone(320, 0.08, 'triangle')
        break
      case 'click':
        playTone(400, 0.05, 'triangle', 0.04)
        break
      case 'explore':
        playTone(300, 0.1)
        setTimeout(() => playTone(450, 0.15), 90)
        break
      default:
        break
    }
  },
}
