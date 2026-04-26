import { useEffect, useLayoutEffect, useState } from 'react'

export type TutorialStep = {
    selector: string
    text: string
}

const STORAGE_KEY = 'faro_tutorial_done_v1'

export function hasSeenTutorial(): boolean {
    return localStorage.getItem(STORAGE_KEY) === '1'
}

export function markTutorialSeen() {
    localStorage.setItem(STORAGE_KEY, '1')
}

type Rect = { top: number; left: number; width: number; height: number }

function getRect(selector: string): Rect | null {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return null
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export function Tutorial({
    steps,
    onClose,
}: {
    steps: TutorialStep[]
    onClose: () => void
}) {
    const [index, setIndex] = useState(0)
    const [rect, setRect] = useState<Rect | null>(null)
    const step = steps[index]

    useLayoutEffect(() => {
        if (!step) return
        // wait one frame so any scrollIntoView has time to settle the layout
        const id = requestAnimationFrame(() => setRect(getRect(step.selector)))
        return () => cancelAnimationFrame(id)
    }, [step])

    useEffect(() => {
        function onResize() {
            if (step) setRect(getRect(step.selector))
        }
        window.addEventListener('resize', onResize)
        window.addEventListener('scroll', onResize, true)
        return () => {
            window.removeEventListener('resize', onResize)
            window.removeEventListener('scroll', onResize, true)
        }
    }, [step])

    if (!step) return null

    const isLast = index === steps.length - 1

    function next() {
        if (isLast) {
            markTutorialSeen()
            onClose()
        } else {
            setIndex(index + 1)
        }
    }

    function skip() {
        markTutorialSeen()
        onClose()
    }

    const padding = 8
    const spotlight = rect
        ? {
              top: rect.top - padding,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
          }
        : null

    // Card placement: below the spotlight if there's room, otherwise above.
    const viewportH = window.innerHeight
    const cardOffset = 16
    const cardWidth = 340
    let cardTop = 0
    let cardLeft = 0
    if (spotlight) {
        cardTop = spotlight.top + spotlight.height + cardOffset
        const estimatedCardHeight = 220
        if (cardTop + estimatedCardHeight > viewportH - 16) {
            cardTop = Math.max(16, spotlight.top - estimatedCardHeight - cardOffset)
        }
        cardLeft = Math.min(
            Math.max(16, spotlight.left + spotlight.width / 2 - cardWidth / 2),
            window.innerWidth - cardWidth - 16,
        )
    }

    return (
        <div className="tutorial-root">
            {spotlight && (
                <div
                    className="tutorial-spotlight"
                    style={{
                        top: spotlight.top,
                        left: spotlight.left,
                        width: spotlight.width,
                        height: spotlight.height,
                    }}
                />
            )}

            {spotlight && (
                <div
                    className="tutorial-card"
                    style={{ top: cardTop, left: cardLeft, width: cardWidth }}
                >
                    <div className="tutorial-card-head">
                        <img className="tutorial-mascot" src="/assets/landing-hero.jpg" alt="Mascota" />
                        <div className="tutorial-bubble">
                            <p>{step.text}</p>
                        </div>
                    </div>
                    <div className="tutorial-actions">
                        <button className="tutorial-skip" type="button" onClick={skip}>
                            Saltar
                        </button>
                        <div className="tutorial-progress">
                            {steps.map((_, i) => (
                                <span
                                    key={i}
                                    className={`tutorial-dot ${i === index ? 'tutorial-dot-active' : ''}`}
                                />
                            ))}
                        </div>
                        <button className="tutorial-next" type="button" onClick={next}>
                            {isLast ? 'Entendido' : 'Siguiente →'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
