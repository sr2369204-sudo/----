import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/** Space the frame takes on each side of the page, in pixels. */
export const MUSHAF_FRAME_INSET_X = 11;
export const MUSHAF_FRAME_INSET_Y = 9;

type Props = {
  width: number;
  height: number;
  isDark: boolean;
};

/**
 * The gold double border of a printed mushaf page: a thick outer line, a thin
 * inner line, a small ornament in each corner and a diamond in the middle of
 * each side. Drawn natively around the page, so it costs nothing inside the
 * WebView and looks the same on every phone.
 */
export const MushafFrame = memo(function MushafFrame({ width, height, isDark }: Props) {
  if (width <= 0 || height <= 0) {
    return null;
  }
  const gold = isDark ? '#9c7f45' : '#b8923f';
  const goldSoft = isDark ? '#6f5a31' : '#d4b872';
  const fill = isDark ? '#191309' : '#fffdf7';
  const outer = 2.5;
  const inner = 6.5;
  // Ornaments sit on the middle of the gap between the two lines.
  const mid = (outer + inner) / 2;
  const right = width - outer;
  const bottom = height - outer;
  const innerRight = width - inner;
  const innerBottom = height - inner;
  const midX = width / 2;
  const midY = height / 2;

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none">
      <Rect
        x={outer}
        y={outer}
        width={right - outer}
        height={bottom - outer}
        rx={5}
        fill={fill}
        stroke={gold}
        strokeWidth={2}
      />
      <Rect
        x={inner}
        y={inner}
        width={innerRight - inner}
        height={innerBottom - inner}
        rx={3}
        fill="none"
        stroke={goldSoft}
        strokeWidth={0.9}
      />
      {CORNERS.map((corner) => {
        const x = corner.left ? mid : width - mid;
        const y = corner.top ? mid : height - mid;
        return (
          <G key={corner.key} transform={`translate(${x} ${y})`}>
            <Circle cx={0} cy={0} r={4.4} fill={fill} stroke={gold} strokeWidth={1.3} />
            <Circle cx={0} cy={0} r={1.7} fill={gold} />
          </G>
        );
      })}
      {[
        { key: 'top', x: midX, y: mid },
        { key: 'bottom', x: midX, y: height - mid },
        { key: 'left', x: mid, y: midY },
        { key: 'right', x: width - mid, y: midY },
      ].map((mark) => (
        <Path
          key={mark.key}
          transform={`translate(${mark.x} ${mark.y})`}
          d="M0 -4.4 L4.4 0 L0 4.4 L-4.4 0 Z"
          fill={fill}
          stroke={gold}
          strokeWidth={1.2}
        />
      ))}
    </Svg>
  );
});

const CORNERS = [
  { key: 'tl', left: true, top: true },
  { key: 'tr', left: false, top: true },
  { key: 'bl', left: true, top: false },
  { key: 'br', left: false, top: false },
];
