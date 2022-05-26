import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';

// SCALE CONTENT ON DEVICES:
/*------------------------*/
const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  } = Dimensions.get('window');
  
  // based on pixel 3a (primary test device) scale
  const scale_width = SCREEN_WIDTH / 393;
  const scale_height = SCREEN_HEIGHT / 760;
/*------------------------*/

// Adapted from: https://medium.com/nerd-for-tech/react-native-styles-normalization-e8ce77a3110c
function normalize(size, based = 'width') {
    const newSize = (based === 'height') ? 
                    size * scale_height : size * scale_width;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
//for width  pixel
export const normaliseWidth = (size) => {
    return normalize(size, 'width');
};
//for height  pixel
export const normaliseHeight = (size) => {
    return normalize(size, 'height');
};
//for font  pixel
export const normaliseFont = (size) => {
    return normaliseHeight(size);
};
/*------------------------*/