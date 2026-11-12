export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `n` distinct random items from `pool`, excluding anything `same` matches. */
export function sample<T>(pool: T[], n: number, exclude: (x: T) => boolean = () => false): T[] {
  return shuffle(pool.filter((x) => !exclude(x))).slice(0, n);
}
