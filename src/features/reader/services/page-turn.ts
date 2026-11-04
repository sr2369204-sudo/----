export type PageTurnIntent = 'next' | 'previous';

export function resolvePageTurnIntent(
  dx: number,
  velocityX: number,
  distanceThreshold: number,
): PageTurnIntent | null {
  'worklet';
  if (dx > distanceThreshold || (dx > 25 && velocityX > 200)) {
    return 'next';
  }
  if (dx < -distanceThreshold || (dx < -25 && velocityX < -200)) {
    return 'previous';
  }
  return null;
}

export function resolvePagePull(dx: number, canGoNext: boolean, canGoPrev: boolean): number {
  'worklet';
  if (!Number.isFinite(dx)) {
    return 0;
  }
  if (dx > 0) {
    return canGoNext ? dx : 0;
  }
  return canGoPrev ? dx : 0;
}
