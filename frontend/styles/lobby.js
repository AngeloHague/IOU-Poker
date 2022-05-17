import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';
import { normaliseFont, normaliseHeight, normaliseWidth } from './normalize'
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';

// // SCALE CONTENT ON DEVICES:
// /*------------------------*/
// const {
//   width: SCREEN_WIDTH,
//   height: SCREEN_HEIGHT,
// } = Dimensions.get('window');

// // based on pixel 3a's scale
// const scale_width = SCREEN_WIDTH / 412;
// const scale_height = SCREEN_HEIGHT / 846;

// export function normalize(size) {
//   const newSize = size * scale 
//   if (Platform.OS === 'ios') {
//     return Math.round(PixelRatio.roundToNearestPixel(newSize))
//   } else {
//     return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
//   }
// }
// /*------------------------*/

export const styles = StyleSheet.create({
    playerScroller: {
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
    },
    playerContainer: {
        flex: 0,
        flexDirection: 'row',
        marginHorizontal: normaliseWidth(40),
        marginVertical: normaliseHeight(15),
    },
    playerCard: {
        borderColor: '#E9446A',
        borderWidth: normaliseWidth(5),
        height: normaliseWidth(150), // ensures equilateral
        width: normaliseWidth(150),
        fontSize: normaliseFont(15),
        marginHorizontal: normaliseWidth(17.5),
        flex:0, justifyContent: 'space-between',
    },
    playerName: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: normaliseFont(15),
        paddingTop: normaliseHeight(10)
    },
    playerStatus: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: normaliseFont(15),
        paddingBottom: normaliseHeight(10)
    },
    playerReady: {
        backgroundColor: 'red',
        borderColor: '#8A8F9E',
        borderRadius: StyleSheet.hairlineWidth,
        height: normaliseHeight(40),
        fontSize: normaliseFont(15),
        //color: '#161F3D'
    },
    gameContainer: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: 'grey',
        position: 'absolute',
        height: normaliseHeight(200),
        width: normaliseWidth(415),
        bottom: normaliseHeight(50)
    },
    menuOptions: {
        flex:1, justifyContent: 'space-around',
    },
    optionsButton: {
        flex: 0,
        marginHorizontal: normaliseWidth(30),
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: normaliseHeight(40),
        alignItems: 'center',
        justifyContent: 'center',
        //paddingHorizontal: 10,
        //marginBottom: 20,
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    readyButton: {
        marginHorizontal: normaliseWidth(30),
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: normaliseHeight(52),
        alignItems: 'center',
        justifyContent: 'center',
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    gameCode: {
        fontSize: normaliseFont(75),
        fontWeight: '400',
        textAlign: 'center'
    },
    heading: {
        marginVertical: normaliseHeight(8),
        fontSize: normaliseFont(18),
        fontWeight: 'bold',
        textAlign: 'center'
    },
    board: {
        flex: 1,
        //backgroundColor: 'red', // debug purposes
    },
    cardContainer: {
        alignItems: 'center', //Centered vertically
        flex:1, flexDirection: 'row', justifyContent: 'space-around',
        //marginHorizontal: 8
    },
    playedHandContainer: {
        alignItems: 'center', //Centered vertically
        flexGrow: 1,
        flex:1, flexDirection: 'column',// justifyContent: 'space-around',
        //backgroundColor: 'green', // debug purposes
        marginHorizontal: normaliseWidth(8)
    },
    playedHand: {
        alignItems: 'center', //Centered vertically
        flexGrow: 2,
        flex:1, flexDirection: 'row', justifyContent: 'space-around',
        backgroundColor: 'green',
        //marginHorizontal: 8
    },
    cardView: {
        width: normaliseWidth(58),
        height: normaliseHeight(80),
        padding: 10,
    },
    communityCard: {
        width: normaliseWidth(58),
        height: normaliseHeight(80),
        //margin: 5,
    },
    card: {
        flexDirection: 'column',
        width: normaliseWidth(58),
        height: normaliseWidth(80),
        backgroundColor: '#fff',
        borderRadius: normaliseFont(10),
        borderWidth: 2,
        borderColor: 'black',
        margin: 5,
    },
    cardHeader: {
        flex: .5,
    },
    cardValue: {
        fontFamily: 'Roboto_400Regular',
        fontSize: normaliseFont(20),
        fontWeight: 'bold',
        marginHorizontal: normaliseWidth(5),
    },
    cardSuit: {
        flex: 1,
        margin: 'auto',
        textAlign: 'center',
        fontSize: normaliseFont(35),
        fontWeight: '500',
    },
    card1: {
        //width: 58,
        //height: 80,
        marginRight: normaliseWidth(-50),
        transform: [{ rotate: '-16deg' }],
    },
    card2: {
        //width: 58,
        //height: 80,
        marginLeft: normaliseWidth(-50),
        transform: [{ rotate: '16deg' }],
    },
    communityCards: {
        fontSize: normaliseFont(48),
        fontWeight: '400',
        textAlign: 'center',
    },
    commCardContainer: {
        //backgroundColor: 'green', // debug purposes
        //flexGrow: 1,
        //flex: 1,
        flexDirection: 'column',
        //justifyContent: 'space-evenly'
    },
    // Game Info CSS:
    gameInfoParentContainer: {
        flexGrow: 1,
    },
    gameInfoContainer: {
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    gameInfoLabels: {
        //
    },
    gameInfo: {
        fontSize: normaliseFont(20)
    }
})