import { StyleSheet } from "react-native"
import { normaliseFont, normaliseHeight, normaliseWidth } from "./normalize"

export const poker_red = '#c72020'

export default StyleSheet.create({
    
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        position: "relative",
        backgroundColor: 'blue',
        //backgroundColor: '#f0f0f0',
        //backgroundColor: '#cfcfcf',
    },
    bigLogo: {
      width: normaliseHeight(220.5),
      height: normaliseHeight(175),
      marginTop: normaliseHeight(50)
    },
    greeting: {
        marginTop: normaliseHeight(30),
        fontSize: 18,
        fontWeight: '400',
        fontFamily: 'Oswald_400Regular',
        textAlign: 'center',
        color: 'white',
    },
    mainMenu: {
        marginVertical: normaliseHeight(48),
        marginHorizontal: normaliseWidth(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: normaliseHeight(40),
        fontSize: normaliseFont(15),
        color: '#161F3D'
    },
    navBar: {
        margin: 0,
        padding: 0,
        height: normaliseHeight(63),
        marginTop: normaliseHeight(30),
        //paddingBottom: normaliseHeight(25),
        //justifyContent: 'center', //Centered horizontally
        alignItems: 'center', //Centered vertically
        flex:0, flexDirection: 'row', justifyContent: 'space-between',
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
        marginHorizontal: normaliseWidth(15),
        //backgroundColor: '#fff'
    },
    navLogo: {
        margin: 0,
        padding: 0,
        width: normaliseWidth(63),
        height: normaliseHeight(51),
    },
    navButton: {
        //backgroundColor: poker_red,
        //backgroundColor: '#6a89b8',
        borderRadius: 4,
        height: normaliseHeight(45),
        width: normaliseWidth(45),
        justifyContent: 'center', //Centered horizontally
        alignItems: 'center', //Centered vertically
    },
    errorMessage: {
        height: normaliseHeight(72),
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: normaliseWidth(30)
    },
    error: {
        color: '#E9446A',
        fontSize: normaliseHeight(13),
        fontWeight: '600',
        textAlign: 'center'
    },
    form: {
        marginBottom: normaliseHeight(48),
        marginHorizontal: normaliseWidth(30)
    },
    inputTitle: {
        //color: '#8A8F9E',
        color: '#c0c0c0',
        fontSize: normaliseFont(10),
        textTransform: 'uppercase'
    },
    input: {
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: normaliseHeight(40),
        fontSize: normaliseHeight(15),
        // color: '#161F3D',
        color: '#fff',
    },
    button: {
        marginHorizontal: normaliseWidth(30),
        // backgroundColor: '#E9446A',
        backgroundColor: poker_red,
        //backgroundColor: '#6a89b8',
        borderRadius: normaliseHeight(4),
        height: normaliseHeight(50),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '500',
        textTransform: 'uppercase'
        //fontFamily: 'Oswald_400Regular',
    },
})