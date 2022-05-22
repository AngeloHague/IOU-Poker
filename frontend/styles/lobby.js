import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';
import { normaliseFont, normaliseHeight, normaliseWidth } from './normalize'
import { poker_red } from './common'

const playerCardMargins = () => {
    return (393 - (normaliseHeight(150)*2))/3
    // dynamically assigns margins to ensure 2 players are always displayed
}

export const styles = StyleSheet.create({
    playerScroller: {
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
        //backgroundColor: '#c1c9c4',
        // backgroundColor: '#87c799',
    },
    playerContainer: {
        flex: 0,
        flexDirection: 'row',
        //marginHorizontal: normaliseWidth(playerCardMargins())/2,
        marginVertical: normaliseHeight(15),
    },
    playerCard: {
        borderColor: 'black',
        backgroundColor: poker_red,
        borderRadius: 10,
        borderWidth: normaliseWidth(5),
        height: normaliseHeight(150), // ensures equilateral
        width: normaliseHeight(150),
        fontSize: normaliseFont(15),
        marginLeft: normaliseWidth(playerCardMargins()),
        flex:0, justifyContent: 'space-between',
    },
    playerName: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: normaliseFont(15),
        paddingTop: normaliseHeight(10)
    },
    playerStatus: {
        color: 'white',
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
        //backgroundColor: '#a9d6a5',
        // backgroundColor: '#87c799',
        // backgroundColor: '#a3bfab',
        //backgroundColor: '#c1c9c4',
        flexGrow: 1,
    },
    footer: {
        //backgroundColor: '#a9d6a5',
        //backgroundColor: '#f0f0f0',
        backgroundColor: '#fff',
        position: 'absolute',
        height: normaliseHeight(250),
        width: '100%',
        bottom: normaliseHeight(50),
        borderTopWidth: normaliseHeight(1),
        borderRadius: 20, borderColor: 'grey',
    },
    menuOptions: {
        flex:1, justifyContent: 'space-around',
    },
    expandOptionsButton: {
        //backgroundColor: '#f0f0f0',
        borderRadius: 4,
        height: normaliseHeight(52),
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        flexDirection: 'row',
        marginHorizontal: 0
    },
    flex3: {
        flex: 3,
    },
    flex1: {
        flex: 1,
    },
    optionsButton: {
        flex: 0,
        marginHorizontal: normaliseWidth(30),
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: normaliseHeight(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    readyButton: {
        marginHorizontal: normaliseWidth(10),
        marginTop: normaliseHeight(7.5),
        backgroundColor: poker_red,
        borderRadius: 20,
        height: normaliseHeight(45),
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameCode: {
        fontSize: normaliseFont(75),
        fontWeight: '400',
        textAlign: 'center',
        color: '#fff'
    },
    heading: {
        marginVertical: normaliseHeight(8),
        fontSize: normaliseFont(18),
        fontFamily: 'Oswald_400Regular',
        fontWeight: 'bold',
        textAlign: 'center',
        //color: '#c0c0c0',
        color: '#fff',
    },
    pot: {
        marginVertical: normaliseHeight(8),
        fontSize: normaliseFont(18),
        fontFamily: 'Oswald_400Regular',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
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
        // backgroundColor: '#c1bad4',
        borderRadius: normaliseFont(10),
        borderWidth: normaliseWidth(1.5),
        borderColor: 'black',
        margin: 5,
    },
    cardHeader: {
        flex: .75,
    },
    cardValue: {
        fontFamily: 'Roboto_500Medium',
        fontSize: normaliseFont(20),
        fontWeight: 'bold',
        marginHorizontal: normaliseWidth(5),
        backgroundColor: 'transparent',
        //paddingBottom: normaliseWidth(5),
    },
    cardIcon: {
        flex: 1,
        textAlign: 'left',
        fontSize: normaliseFont(20),
        marginLeft: normaliseWidth(3),
        //backgroundColor: 'blue',
        //transform: [{translateY: normaliseWidth(5)}]
    },
    cardSuit: {
        flex: 1,
        margin: 'auto',
        textAlign: 'center',
        fontSize: normaliseFont(35),
        backgroundColor: 'transparent',
    },
    cardFooter: {
        flex: 0.1,
        backgroundColor: 'transparent',
    },
    card1: {
        //width: 58,
        //height: 80,
        marginRight: normaliseWidth(-60),
        transform: [{ translateY: normaliseWidth(45)}, {rotate: '-16deg'}, {translateY: normaliseWidth(-45) },],
    },
    card2: {
        //width: 58,
        //height: 80,
        marginLeft: normaliseWidth(-60),
        transform: [{ translateY: normaliseWidth(45)}, {rotate: '16deg'}, {translateY: normaliseWidth(-45)},],
    },
    communityCards: {
        fontSize: normaliseFont(48),
        fontWeight: '400',
        textAlign: 'center',
    },
    commCardContainer: {
        //backgroundColor: 'red', // debug purposes
        //flexGrow: 1,
        //flex: 1,
        marginVertical: normaliseHeight(10),
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
        justifyContent: 'center'
    },
    gameInfoLabels: {
        fontSize: normaliseFont(16),
        color: 'black',
        fontWeight: '500',
        fontFamily: 'Roboto_500Medium',
        textTransform: 'uppercase',
        textAlign: 'right',
    },
    gameInfo: {
        fontSize: normaliseFont(16),
        color: '#fff',
        fontFamily: 'Roboto_400Regular',
        marginLeft: normaliseWidth(5),
        marginRight: normaliseWidth(30),
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        fontSize: normaliseFont(16),
    },
    raiseAmount: {
        fontSize: normaliseFont(24),
    },
    modalHelp: {
        width: normaliseWidth(300),
        height: normaliseHeight(150),
    },
    modalRaise: {
        width: normaliseWidth(375),
        height: normaliseHeight(225),
    },
    modalButton: {
        flex: 0,
        margin: normaliseWidth(5),
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: normaliseHeight(25),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
})