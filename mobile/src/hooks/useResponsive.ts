import { useWindowDimensions, PixelRatio } from 'react-native';

const BASE_WIDTH = 375; // Base design width

export const useResponsive = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const scale = (size: number) => {
    const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scaleFactor;
    
    // Cap scaling to prevent massive UI on huge screens
    if (scaleFactor > 1.5) {
      return size * 1.5;
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };

  return {
    scale,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
  };
};
