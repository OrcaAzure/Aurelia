import { STARTER_INGREDIENTS } from '@/cards'
import { useGameStore } from '@/stores/gameStore'
import { CardView } from '@/ui/components/CardView'

export function HomeScreen() {
  const phase = useGameStore((state) => state.phase)
  const hand = useGameStore((state) => state.hand)

  const handCards = hand
    .map((id) => STARTER_INGREDIENTS.find((card) => card.id === id))
    .filter((card): card is (typeof STARTER_INGREDIENTS)[number] => card !== undefined)

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
      <header className="mb-12 text-center">
        <p className="mb-2 font-display text-sm uppercase tracking-[0.35em] text-amber-light">
          Alchemy Deckbuilder
        </p>
        <h1 className="font-display text-5xl font-semibold tracking-wide text-parchment">
          Aurelia
        </h1>
        <p className="mt-4 text-lg text-parchment/70">
          Discover ingredients. Experiment. Unlock the journal.
        </p>
        <p className="mt-2 text-sm uppercase tracking-widest text-parchment/50">
          Phase: {phase}
        </p>
      </header>

      <section>
        <h2 className="mb-6 font-display text-xl text-amber-light">
          Your Hand
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {handCards.map((card, index) => (
            <CardView key={card.id} card={card} index={index} />
          ))}
        </div>
      </section>
    </main>
  )
}
