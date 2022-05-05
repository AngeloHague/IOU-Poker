import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';

// SCALE CONTENT ON DEVICES:
/*------------------------*/
const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on pixel 3a's scale
const scale = SCREEN_WIDTH / 1080;

export function normalize(size) {
  const newSize = size * scale 
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}
/*------------------------*/

export const styles = StyleSheet.create({
    playerScroller: {
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
    },
    playerContainer: {
        flex: 0,
        flexDirection: 'row',
        marginHorizontal: 80,
        marginVertical: 15,
    },
    playerCard: {
        borderColor: '#E9446A',
        borderWidth: 10,
        height: 200,
        width: 200,
        fontSize: 15,
        marginHorizontal: 25,
        flex:0, justifyContent: 'space-between',
    },
    playerName: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
        paddingTop: 10
    },
    playerStatus: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
        paddingBottom: 10
    },
    playerReady: {
        backgroundColor: 'red',
        borderColor: '#8A8F9E',
        borderRadius: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        //color: '#161F3D'
    },
    gameContainer: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: 'grey',
        position: 'absolute',
        height: 200,
        width: 415,
        bottom: 50
    },
    menuOptions: {
        flex:1, justifyContent: 'space-around',
    },
    optionsButton: {
        flex: 0,
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        //paddingHorizontal: 10,
        //marginBottom: 20,
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    readyButton: {
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    gameCode: {
        fontSize: 75,
        fontWeight: '400',
        textAlign: 'center'
    },
    greeting: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center'
    },
    board: {

    },
    cardContainer: {
        alignItems: 'center', //Centered vertically
        flex:1, flexDirection: 'row', justifyContent: 'space-around',
        marginHorizontal: 8
    },
    yourCardContainer: {
        alignItems: 'center', //Centered vertically
        flex:1, flexDirection: 'row', justifyContent: 'space-around',
        //marginHorizontal: 8
    },
    cardView: {
        width: 58,
        height: 80,
        padding: 10,
    },
    card: {
        width: 58,
        height: 80,
        margin: 25,
    },
    card1: {
        width: 58,
        height: 80,
        marginRight: -50,
        transform: [{ rotate: '-16deg' }],
    },
    card2: {
        width: 58,
        height: 80,
        marginLeft: -50,
        transform: [{ rotate: '16deg' }],
    },
    communityCards: {
        fontSize: 48,
        fontWeight: '400',
        textAlign: 'center'
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
        //
    }
})