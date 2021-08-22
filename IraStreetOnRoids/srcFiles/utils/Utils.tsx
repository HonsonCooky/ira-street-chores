import {View} from "react-native";
import {ListItem} from 'react-native-elements'
import AppLoading from "expo-app-loading";
import {ActivityIndicator, RadioButton, Text} from "react-native-paper";
import {styles} from "./Styles";
import React from "react";


export function asyncHelper(callBack: Function, indicator?: string) {
    if (indicator) {
        return (
            <View>
                <AppLoading
                    startAsync={() => callBack()}
                    onFinish={() => {
                    }}
                    onError={() => {
                    }}
                />
            </View>
        )
    }
    return (
        <View>
            <AppLoading
                startAsync={() => callBack()}
                onFinish={() => {
                }}
                onError={() => {
                }}
            />
            <ActivityIndicator style={styles.activityIndicator} size={"large"}/>
        </View>
    )
}

function analyseSpecialKey(key: string, value: string, specialKey?: string) {
    if (specialKey != undefined && value === specialKey) return styles.specialListContents
    return styles.listContents

}

export function renderList(list: Array<{ key: any, value: any }>, specialKey?: string) {
    return list.map(({key, value}) => {
        let sty = analyseSpecialKey(key, value, specialKey)
        return (<View style={sty} key={key + value}>
            <ListItem.Title>
                <Text style={styles.para2BigBold}>{key}</Text>
            </ListItem.Title>
            <ListItem.Subtitle>
                <Text style={styles.para2}>{value}</Text>
            </ListItem.Subtitle>
        </View>)
    })
}


export function renderList2(list: Array<{ key: any, value: string, value2: string }>, renderNum: number) {
    return list.map(({key, value, value2}) => {
        let date = new Date(Date.parse(value2))
        let dateStr = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()
        return (
            <View style={styles.listContents} key={key + value + value2}>
                <ListItem.Title>
                    <Text style={styles.para2BigBold}>{key}</Text>
                </ListItem.Title>
                <ListItem.Subtitle>
                    <Text style={styles.para2}>Purchased by: {value}</Text>
                </ListItem.Subtitle>
                <ListItem.Subtitle>
                    <Text style={styles.para2}>Purchase date: {dateStr}</Text>
                </ListItem.Subtitle>
            </View>)
    }).slice(0, renderNum)
}

export function renderList3(list: Array<{ key: any, value: string, value2: string }>) {
    return list.map(({key, value, value2}) => {
        let date = new Date(Date.parse(value2))
        let dateStr = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()
        return (
            <View style={styles.listContents} key={key + value + value2}>
                <ListItem.Title>
                    <Text style={styles.para2BigBold}>{key}</Text>
                </ListItem.Title>
                <ListItem.Subtitle>
                    <Text style={styles.para2}>Amount: ${parseFloat(value).toFixed(2)}</Text>
                </ListItem.Subtitle>
                <ListItem.Subtitle>
                    <Text style={styles.para2}>Date: {dateStr}</Text>
                </ListItem.Subtitle>
            </View>)
    })
}


function analyseSpecialVal(key: string, value: boolean) {
    return value ? styles.specialTaskContents : styles.taskContents

}

export function renderTasks(list: Array<{ key: string; value: boolean }>, callback: (s: string) => void) {
    if (!list || list.length === 0) return <Text style={styles.para2BigBold}>No Contents</Text>
    return list.map(({key, value}) => {
        let sty = analyseSpecialVal(key, value)
        return (
            <View style={sty} key={key + value.toString()}>
                <RadioButton.Item
                    value={"On Press"}
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => callback(key)}
                    label={key}
                    labelStyle={styles.para2}
                />
            </View>
        )
    })
}


export const UserContext = React.createContext('')