import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375; // Base design width (e.g., iPhone 11/12/13/SE)

export const scale = (size: number) => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleFactor;
  
  // Limit scaling for very large screens (e.g. tablets) to prevent comically large text
  if (scaleFactor > 1.5) {
      return size * 1.5;
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
