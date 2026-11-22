import { HEART_CELLS } from '../data/heart-cells';

/**
 * Resolves a tap on the Quran Heart to a surah.
 *
 * The shapes deliberately carry no touch handlers of their own: on web
 * `react-native-svg` turns `onPress` into RN responder props on the DOM node
 * (react-dom then warns about `onResponderTerminate`), and on native those
 * handlers compete with the pan/pinch gestures. So the map listens for a tap
 * once and asks this module which cell sits under the finger, testing the very
 * same geometry that draws the cells.
 *
 * Every path is flattened to a polygon a single time, when this module loads.
 */

type Polygon = {
  /** Flat `x, y, x, y…` vertex list. */
  points: number[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type CellShape = {
  surahNumber: number;
  polygons: Polygon[];
};

const COMMAND_RE = /[a-zA-Z]/;
const TOKEN_RE = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

/** One axis of a cubic bézier at parameter `t`. */
function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Flattens a path `d` into flat polygon vertices (béziers sampled).
 *
 * For relative commands every repeated parameter group is offset from the point
 * the *previous group* ended at, so the origin is re-read inside each loop —
 * capturing it once per command letter would drift the whole shape.
 */
function flattenPath(d: string): number[] {
  const tokens = d.match(TOKEN_RE) ?? [];
  const points: number[] = [];
  let i = 0;
  let command = '';
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;

  while (i < tokens.length) {
    if (COMMAND_RE.test(tokens[i])) {
      command = tokens[i];
      i += 1;
    }
    const relative = command === command.toLowerCase();
    const read = () => Number(tokens[i++]);

    switch (command) {
      case 'M':
      case 'm':
        cx = read() + (relative ? cx : 0);
        cy = read() + (relative ? cy : 0);
        startX = cx;
        startY = cy;
        points.push(cx, cy);
        break;
      case 'L':
      case 'l':
        while (i < tokens.length && !COMMAND_RE.test(tokens[i])) {
          cx = read() + (relative ? cx : 0);
          cy = read() + (relative ? cy : 0);
          points.push(cx, cy);
        }
        break;
      case 'H':
      case 'h':
        while (i < tokens.length && !COMMAND_RE.test(tokens[i])) {
          cx = read() + (relative ? cx : 0);
          points.push(cx, cy);
        }
        break;
      case 'V':
      case 'v':
        while (i < tokens.length && !COMMAND_RE.test(tokens[i])) {
          cy = read() + (relative ? cy : 0);
          points.push(cx, cy);
        }
        break;
      case 'C':
      case 'c':
        while (i < tokens.length && !COMMAND_RE.test(tokens[i])) {
          const rx = relative ? cx : 0;
          const ry = relative ? cy : 0;
          const x1 = read() + rx;
          const y1 = read() + ry;
          const x2 = read() + rx;
          const y2 = read() + ry;
          const x = read() + rx;
          const y = read() + ry;
          for (let t = 0.1; t <= 1.0001; t += 0.1) {
            points.push(cubicAt(cx, x1, x2, x, t), cubicAt(cy, y1, y2, y, t));
          }
          cx = x;
          cy = y;
        }
        break;
      case 'Z':
      case 'z':
        cx = startX;
        cy = startY;
        break;
      default:
        // Unknown command: skip its numbers so the cursor never stalls.
        while (i < tokens.length && !COMMAND_RE.test(tokens[i])) {
          i += 1;
        }
        break;
    }
  }

  return points;
}

function buildPolygon(d: string): Polygon {
  const points = flattenPath(d);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { points, minX, minY, maxX, maxY };
}

const CELL_SHAPES: CellShape[] = HEART_CELLS.map((cell) => ({
  surahNumber: cell.surahNumber,
  polygons: cell.paths.map(buildPolygon),
}));

function pointInPolygon(polygon: Polygon, x: number, y: number): boolean {
  if (x < polygon.minX || x > polygon.maxX || y < polygon.minY || y > polygon.maxY) {
    return false;
  }
  const { points } = polygon;
  let inside = false;
  for (let a = 0, b = points.length - 2; a < points.length; b = a, a += 2) {
    const ax = points[a];
    const ay = points[a + 1];
    const bx = points[b];
    const by = points[b + 1];
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

/** Surah number whose cell contains the given viewBox point, or `null`. */
export function findHeartCellAt(x: number, y: number): number | null {
  for (const cell of CELL_SHAPES) {
    for (const polygon of cell.polygons) {
      if (pointInPolygon(polygon, x, y)) {
        return cell.surahNumber;
      }
    }
  }
  return null;
}
