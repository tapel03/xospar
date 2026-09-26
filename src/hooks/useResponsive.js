import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

// Reference device the original designs were laid out on (375 x 812).
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Widest a screen's content column is allowed to get (keeps tablets from
// stretching everything edge to edge).
export const MAX_CONTENT_WIDTH = 560;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Screen-size helpers so layouts adapt to small phones, tall phones and
 * tablets instead of relying on fixed pixel values.
 *
 *   sw(n) - scales n with screen WIDTH  (font sizes, horizontal spacing)
 *   sh(n) - scales n with screen HEIGHT (heights, vertical spacing)
 *
 * Both are clamped, so nothing gets tiny on a small phone or oversized
 * on a tablet.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const widthScale = clamp(width / BASE_WIDTH, 0.9, 1.3);
    const heightScale = clamp(height / BASE_HEIGHT, 0.8, 1.2);

    return {
      width,
      height,
      sw: (size) => Math.round(size * widthScale),
      sh: (size) => Math.round(size * heightScale),
    };
  }, [width, height]);
}

export default useResponsive;