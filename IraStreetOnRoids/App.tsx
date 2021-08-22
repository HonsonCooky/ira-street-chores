import React, {Component} from 'react';
import Login from "./srcFiles/pages/Login";
import Navigator from "./srcFiles/utils/Navigator";
import {View} from "react-native";
import {UserContext} from "./srcFiles/utils/Utils";
import {styles, themeColors} from "./srcFiles/utils/Styles";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {clearUserData, getData, StoreKey} from "./srcFiles/BackEndCalls/AsyncStorage";
import {asyncHelper} from "./srcFiles/utils/Utils";
import {StatusBar} from "expo-status-bar";



class App extends Component {
    state = {
        user: "",
        dataLoaded: false,
    }

    async loadUser() {
        await getData(StoreKey.UserName).then((res) => {
            this.setState({dataLoaded: true})
            if (typeof res === "string") {
                let name = JSON.parse(res)[0].name
                if (name) this.setState({user: name})
            }
        }).catch(() => this.setState({dataLoaded: true}))
    }

    removeState(){
        clearUserData().then(_ =>
            this.setState({user: "", dataLoaded: false})
        ).catch(() => {this.setState({user: "", dataLoaded: false})})
    }

    manageAppStart() {
        if (!this.state.dataLoaded) {
            return (
                <View style={styles.container}>
                    {asyncHelper(() => {
                        this.loadUser.bind(this)()
                    })}
                </View>
            )
        }

        if (this.state.user.length === 0) {
            return (<Login par={this}/>)
        }
        return <Navigator user={this.state.user} app={this}/>
    }


    render() {
        return (
            <SafeAreaProvider>
                <StatusBar backgroundColor={themeColors.text1} style={"light"}/>
                <UserContext.Provider value={this.state.user}>
                    {this.manageAppStart()}
                </UserContext.Provider>
            </SafeAreaProvider>
        )
    }
}

export default App