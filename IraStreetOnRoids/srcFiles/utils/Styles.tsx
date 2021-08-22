import {StyleSheet} from "react-native";

const roundedValue = 15
export const para1Size = 24
export const para2Size = 24
export const para3Size = 22

export const themeColors = {
    text1: "#32c8b4",
    text2: "#656565",
    text3: "#7900de",
    text4: "#ffffff",
    text5: "#3b4242",
    base1: "#cbf3f0",
    base2: "#e4fcf7",
    base3: "#dafdda",
    base4: "#fddada",
}

export const styles = StyleSheet.create({
    // CONTAINER
    container: {
        flex: 1,
        paddingVertical: "5%",
        justifyContent: "center",
        backgroundColor: themeColors.base1,
    },
    // COMPONENTS
    component: {
        padding: "5%",
        margin: "5%",
        justifyContent: 'center',
        borderRadius: roundedValue,
        backgroundColor: themeColors.base2,
    },
    componentNoBack: {
        marginHorizontal: "5%",
        justifyContent: 'center',
        borderRadius: roundedValue,
    },
    componentNoBackRow: {
        flexDirection: "row",
        marginBottom: "5%",
        justifyContent: 'center',
        borderRadius: roundedValue,
    },
    // BUTTONS
    button: {
        marginVertical: "2%",
        borderRadius: roundedValue,
        justifyContent: 'center',
        backgroundColor: themeColors.text1,
    },
    button2: {
        marginVertical: "2%",
        borderRadius: roundedValue,
        justifyContent: 'center',
        backgroundColor: themeColors.text2,
    },
    button3: {
        marginVertical: "2%",
        borderRadius: roundedValue,
        justifyContent: 'center',
        backgroundColor: themeColors.text3,
    },
    buttonRow: {
        flex:1,
        marginHorizontal: "1%",
        borderRadius: roundedValue,
        justifyContent: 'center',
        backgroundColor: themeColors.text1,
    },
    buttonRow2: {
        flex:1,
        marginHorizontal: "2%",
        borderRadius: roundedValue,
        justifyContent: 'center',
        backgroundColor: themeColors.text3,
    },
    // ACTION COMPONENTS
    input: {
        fontSize: 32,
        borderTopStartRadius: roundedValue,
        borderTopEndRadius: roundedValue,
        backgroundColor: themeColors.text4,
        fontFamily: "sans-serif-condensed",
    },
    input2: {
        fontSize: 24,
        borderTopStartRadius: roundedValue,
        borderTopEndRadius: roundedValue,
        backgroundColor: themeColors.text4,
        marginVertical: "2%",
        fontFamily: "sans-serif-condensed",
    },
    activityIndicator: {
        height: "50%",
        padding: "20%",
    },
    listContents: {
        borderRadius: roundedValue,
        backgroundColor: themeColors.text4,
        padding: "5%",
        marginVertical: "2%",
    },
    taskContents: {
        borderRadius: roundedValue,
        backgroundColor: themeColors.text4,
        marginVertical: "1%",
    },
    specialListContents: {
        borderRadius: roundedValue,
        backgroundColor: themeColors.base3,
        padding: "5%",
        marginVertical: "2%",
    },
    specialTaskContents: {
        borderRadius: roundedValue,
        backgroundColor: themeColors.base4,
        marginVertical: "1%",
    },
    helpText: {
        fontFamily: "sans-serif-condensed",
        alignSelf: "center",
        fontSize: para3Size,
        color: themeColors.text3
    },
    // TEXTS
    title1: {
        fontSize: 72,
        fontWeight: "bold",
        fontFamily: "monospace",
        alignSelf: "center",
        textAlign: "center",
        color: themeColors.text2,
        paddingBottom: "20%",
    },
    title2: {
        fontSize: 42,
        fontWeight: "bold",
        fontFamily: "monospace",
        alignSelf: "center",
        textAlign: "center",
        color: themeColors.text2,
        paddingTop: "20%",
    },
    title3: {
        fontSize: 36,
        fontWeight: "bold",
        fontFamily: "monospace",
        textAlign: "center",
        marginBottom: "5%",
        color: themeColors.text5,
    },
    title4: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        paddingBottom: "5%",
        color: themeColors.text5,
    },
    para1: {
        fontFamily: "sans-serif-condensed",
        fontSize: para1Size,
        color: themeColors.text4
    },
    para2: {
        fontFamily: "sans-serif-condensed",
        fontSize: para1Size,
        color: themeColors.text2
    },
    para2Light: {
        fontFamily: "sans-serif-condensed",
        fontSize: para2Size,
        color: themeColors.text4
    },
    para2BigBold: {
        fontFamily: "sans-serif-condensed",
        fontWeight: "bold",
        fontSize: para1Size,
        color: themeColors.text2
    },
    para3: {
        fontFamily: "sans-serif-condensed",
        fontSize: para3Size,
        color: themeColors.text3
    }
})