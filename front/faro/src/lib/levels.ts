export type LevelInfo = {
    level: number
    points: number
    stars: number
}

export const levels: LevelInfo[] = Array.from({ length: 20 }, (_, i) => ({
    level: i + 1,
    points: 2 ** (i + 1),
    stars: i + 1,
}))