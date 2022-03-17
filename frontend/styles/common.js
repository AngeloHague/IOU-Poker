import { StyleSheet } from "react-native"

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    navBar: {
        margin: 0,
        padding: 0,
        height: 50,
        marginTop: 75,
        paddingBottom: 25,
        //justifyContent: 'center', //Centered horizontally
        alignItems: 'center', //Centered vertically
        flex:0, flexDirection: 'row', justifyContent: 'space-between',
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
    },
    navLogo: {
        margin: 0,
        padding: 0,
        width: 63,
        height: 50,
    },
    navButton: {
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 30,
        width: 100,
        justifyContent: 'center', //Centered horizontally
        alignItems: 'center', //Centered vertically
    },
    errorMessage: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    error: {
        color: '#E9446A',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    },
    form: {
        marginBottom: 48,
        marginHorizontal: 30
    },
    inputTitle: {
        color: '#8A8F9E',
        fontSize: 10,
        textTransform: 'uppercase'
    },
    input: {
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: '#161F3D'
    },
    button: {
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center'
    }
})