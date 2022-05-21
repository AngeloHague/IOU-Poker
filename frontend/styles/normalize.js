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
  
  export function normalise(size) {
    const newSize = size * scale 
    if (Platform.OS === 'ios') {
      return Math.round(PixelRatio.roundToNearestPixel(newSize))
    } else {
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
  }
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

// Adapted from: https://www.reactnativeschool.com/normalizing-text-and-spacing-between-screen-sizes
export const create = (
    styles,
    widthProperties = [
      'margin',
      'marginHorizontal',
      'padding',
      'paddingHorizontal',
    ],
    heightProperties = [
      'fontSize',
      'marginVertical',
      'paddingVertical',
      'height',
    ]
  ) => {
    const normalizedStyles = {};
    Object.keys(styles).forEach((key) => {
      normalizedStyles[key] = {};
      Object.keys(styles[key]).forEach((property) => {
        if (widthProperties.includes(property)) {
          normalizedStyles[key][property] = normaliseWidth(styles[key][property]);
        } else if (heightProperties.includes(property)) {
          normalizedStyles[key][property] = normaliseHeight(styles[key][property]);
        } else {
          normalizedStyles[key][property] = styles[key][property];
        }
      });
    });
  
    return StyleSheet.create(normalizedStyles);
  };
  /*------------------------*/