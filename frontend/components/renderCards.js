import React from 'react'
import { Image } from 'react-native' ;
import { styles } from '../styles/lobby';

export async function preloadCards() {
    console.log('Preloading images...')
    CARD_IMG_RENDER_MAP.forEach((key, val) => {
        console.log('Loading ', val, ': ', CARD_IMG_RENDER_MAP.get(val))
        {<Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(val)} />}
        console.log('Image Loaded: ', val)
    });
    console.log('Done loading images.')
    return true
}

export const CARD_IMG_RENDER_MAP = new Map ([
    [undefined, require('../assets/playing-cards/Backs/Card-Back-01.png')],
    ['AC', require('../assets/playing-cards/Cards/Classic/c01.png')],
    ['2C', require('../assets/playing-cards/Cards/Classic/c02.png')],
    ['3C', require('../assets/playing-cards/Cards/Classic/c03.png')],
    ['4C', require('../assets/playing-cards/Cards/Classic/c04.png')],
    ['5C', require('../assets/playing-cards/Cards/Classic/c05.png')],
    ['6C', require('../assets/playing-cards/Cards/Classic/c06.png')],
    ['7C', require('../assets/playing-cards/Cards/Classic/c07.png')],
    ['8C', require('../assets/playing-cards/Cards/Classic/c08.png')],
    ['9C', require('../assets/playing-cards/Cards/Classic/c09.png')],
    ['TC', require('../assets/playing-cards/Cards/Classic/c10.png')],
    ['JC', require('../assets/playing-cards/Cards/Classic/c11.png')],
    ['QC', require('../assets/playing-cards/Cards/Classic/c12.png')],
    ['KC', require('../assets/playing-cards/Cards/Classic/c13.png')],

    ['AD', require('../assets/playing-cards/Cards/Classic/d01.png')],
    ['2D', require('../assets/playing-cards/Cards/Classic/d02.png')],
    ['3D', require('../assets/playing-cards/Cards/Classic/d03.png')],
    ['4D', require('../assets/playing-cards/Cards/Classic/d04.png')],
    ['5D', require('../assets/playing-cards/Cards/Classic/d05.png')],
    ['6D', require('../assets/playing-cards/Cards/Classic/d06.png')],
    ['7D', require('../assets/playing-cards/Cards/Classic/d07.png')],
    ['8D', require('../assets/playing-cards/Cards/Classic/d08.png')],
    ['9D', require('../assets/playing-cards/Cards/Classic/d09.png')],
    ['TD', require('../assets/playing-cards/Cards/Classic/d10.png')],
    ['JD', require('../assets/playing-cards/Cards/Classic/d11.png')],
    ['QD', require('../assets/playing-cards/Cards/Classic/d12.png')],
    ['KD', require('../assets/playing-cards/Cards/Classic/d13.png')],
    
    ['AH', require('../assets/playing-cards/Cards/Classic/h01.png')],
    ['2H', require('../assets/playing-cards/Cards/Classic/h02.png')],
    ['3H', require('../assets/playing-cards/Cards/Classic/h03.png')],
    ['4H', require('../assets/playing-cards/Cards/Classic/h04.png')],
    ['5H', require('../assets/playing-cards/Cards/Classic/h05.png')],
    ['6H', require('../assets/playing-cards/Cards/Classic/h06.png')],
    ['7H', require('../assets/playing-cards/Cards/Classic/h07.png')],
    ['8H', require('../assets/playing-cards/Cards/Classic/h08.png')],
    ['9H', require('../assets/playing-cards/Cards/Classic/h09.png')],
    ['TH', require('../assets/playing-cards/Cards/Classic/h10.png')],
    ['JH', require('../assets/playing-cards/Cards/Classic/h11.png')],
    ['QH', require('../assets/playing-cards/Cards/Classic/h12.png')],
    ['KH', require('../assets/playing-cards/Cards/Classic/h13.png')],
    
    ['AS', require('../assets/playing-cards/Cards/Classic/s01.png')],
    ['2S', require('../assets/playing-cards/Cards/Classic/s02.png')],
    ['3S', require('../assets/playing-cards/Cards/Classic/s03.png')],
    ['4S', require('../assets/playing-cards/Cards/Classic/s04.png')],
    ['5S', require('../assets/playing-cards/Cards/Classic/s05.png')],
    ['6S', require('../assets/playing-cards/Cards/Classic/s06.png')],
    ['7S', require('../assets/playing-cards/Cards/Classic/s07.png')],
    ['8S', require('../assets/playing-cards/Cards/Classic/s08.png')],
    ['9S', require('../assets/playing-cards/Cards/Classic/s09.png')],
    ['TS', require('../assets/playing-cards/Cards/Classic/s10.png')],
    ['JS', require('../assets/playing-cards/Cards/Classic/s11.png')],
    ['QS', require('../assets/playing-cards/Cards/Classic/s12.png')],
    ['KS', require('../assets/playing-cards/Cards/Classic/s13.png')],
]);