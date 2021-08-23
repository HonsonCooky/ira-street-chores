import React, {Component} from "react";
import {View} from "react-native";
import {para1Size, styles} from "../utils/Styles";
import {Button, HelperText, RadioButton, Text, TextInput} from "react-native-paper";
import {getUser, setUser} from "../BackEndCalls/NetworkingCalls";
import {ScrollView} from "react-native-gesture-handler";
import {Ionicons} from "@expo/vector-icons";
import {storeData, StoreKey} from "../BackEndCalls/AsyncStorage";
import App from "../../App";
import {asyncHelper} from "../utils/Utils";

interface ps {
    par: App
}

class Login extends Component<ps, any> {
    state = {
        text: "",
        isFlatmate: false,
        invalidAcc: false,
        err: false,
        noText: false,
        atLogin: false,
        atSignup: false,
        atSignupFirst: false,
        loginSuccess: false,
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC
     --------------------------------------------------------------------------------------------------------------*/

    async attemptSignup(): Promise<any> {
        if (this.state.text.length === 0) return {noText: true}
        let userSet = await setUser(this.state.text.trim(), this.state.isFlatmate)
        if (userSet === 400 || userSet === 500) return {err: true}
        return await this.attemptLogin()
    }

    async attemptLogin(): Promise<any> {
        if (this.state.text.length === 0) return {noText: true}

        return await getUser(this.state.text.trim()).then(async res => {
            console.log(res)
            // Valid user, get the name
            if (Array.isArray(res) && res[0] && res[0].name) {
                // Store name, such that the user doesn't have to always login
                return await storeData(StoreKey.UserName, res).then((res: any) => {
                    if (res) {
                        return {loginSuccess: true}
                    }
                    return {err: true}
                }).catch(() => {
                    return {err: true}
                })
            } else {
                return {invalidAcc: true}
            }
        }).catch(() => {
            return {err: true}
        })
    }

    errorMsg() {
        let msg = this.state.err ? `Some error occurred, try again?` :
            this.state.invalidAcc ? "Unknown user. Try again, or signup" :
                "No username entered"
        return (msg)
    }

    /**--------------------------------------------------------------------------------------------------------------
     * RENDER COMPONENTS
     --------------------------------------------------------------------------------------------------------------*/
    title() {
        return (
            <View>
                <Text style={styles.title2}>Ira Street</Text>
                <Text style={styles.title1}>On Roids</Text>
            </View>
        )
    }

    loginButton() {
        return (
            <View>
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.setState({atLogin: true})}>
                    <Ionicons name={"log-in-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Log in</Text>
                </Button>
            </View>
        )
    }

    signupButton() {
        return (
            <View>
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.setState({atSignupFirst: true})}>
                    <Ionicons name={"person-add-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Sign Up</Text>
                </Button>
            </View>
        )
    }

    signupComponents() {
        return (
            <View>
                <RadioButton.Item
                    value={"On Press"}
                    status={this.state.isFlatmate ? 'checked' : 'unchecked'}
                    onPress={() => this.setState({isFlatmate: !this.state.isFlatmate})}
                    label={"I am a flatmate"}
                    labelStyle={styles.para2}
                />
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.setState({atSignup: true})}>
                    <Ionicons name={"person-add-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Sign Up</Text>
                </Button>
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.setState({atSignupFirst: false})}>
                    <Ionicons name={"arrow-back-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Go Back</Text>
                </Button>
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * RENDER PAGES
     --------------------------------------------------------------------------------------------------------------*/

    loginScreen() {
        return (
            <View>
                <View>{this.title()}</View>
                <View style={styles.componentNoBack}>
                    <TextInput style={styles.input}
                               label={'Username'} value={this.state.text}
                               mode={"flat"}
                               onChangeText={t => this.setState({text: t})}
                    />
                    <View>{this.loginButton()}</View>
                    <View>{this.signupButton()}</View>

                    <HelperText type="error" visible={this.state.invalidAcc || this.state.noText || this.state.err}
                                style={styles.helpText}>
                        {this.errorMsg()}
                    </HelperText>
                </View>
            </View>

        )
    }

    signupScreen() {
        return (
            <View>
                <View>{this.title()}</View>
                <View style={styles.componentNoBack}>
                    <TextInput style={styles.input}
                               label={'Username'} value={this.state.text}
                               mode={"flat"}
                               onChangeText={t => this.setState({text: t})}
                    />
                    <View>{this.signupComponents()}</View>

                    <HelperText type="error" visible={this.state.invalidAcc || this.state.noText || this.state.err}
                                style={styles.helpText}>
                        {this.errorMsg()}
                    </HelperText>
                </View>
            </View>

        )
    }


    /**--------------------------------------------------------------------------------------------------------------
     * ASYNC RENDERS
     --------------------------------------------------------------------------------------------------------------*/

    attemptLoginScreen() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    this.attemptLogin.bind(this)().then(r => {
                        const {
                            invalidAcc = false,
                            err = false,
                            noText = false,
                            atLogin = false,
                            atSignup = false,
                            atSignupFirst = false,
                            loginSuccess = false,
                        } = r;

                        this.setState({
                            invalidAcc: invalidAcc,
                            err: err,
                            noText: noText,
                            atLogin: atLogin,
                            atSignup: atSignup,
                            atSignupFirst: atSignupFirst,
                            loginSuccess: loginSuccess,
                        })
                    }).catch(() =>
                        this.setState({
                            invalidAcc: false,
                            err: "Login attempt failed",
                            noText: false,
                            atLogin: false,
                            atSignup: false,
                            atSignupFirst: false,
                            loginSuccess: false,
                        }))
                })}
            </View>
        )
    }

    attemptSignupScreen() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    this.attemptSignup.bind(this)().then(r => {
                        const {
                            invalidAcc = false,
                            err = false,
                            noText = false,
                            atLogin = false,
                            atSignup = false,
                            loginSuccess = false,
                        } = r;

                        this.setState({
                            invalidAcc: invalidAcc,
                            err: err,
                            noText: noText,
                            atLogin: atLogin,
                            atSignup: atSignup,
                            loginSuccess: loginSuccess,
                        })
                    }).catch(() =>
                        this.setState({
                            invalidAcc: false,
                            err: "Signup attempt failed",
                            noText: false,
                            atLogin: false,
                            atSignup: false,
                            atSignupFirst: false,
                            loginSuccess: false,
                        }))
                })}
            </View>
        )
    }


    /**--------------------------------------------------------------------------------------------------------------
     * BASE
     --------------------------------------------------------------------------------------------------------------*/

    manageLogin() {

        // ATTEMPT TO LOG IN
        if (this.state.atLogin) {
            return this.attemptLoginScreen()
        }
        // ATTEMPT TO SIGN UP
        else if (this.state.atSignup) {
            return this.attemptSignupScreen()
        }
        // SUCCESSFUL LOG IN
        else if (this.state.loginSuccess) {
            this.props.par.loadUser.bind(this.props.par)()
        }
        // On signup screen
        else if (this.state.atSignupFirst) {
            return this.signupScreen()
        }
        // LOGIN SCREEN
        else if (!this.state.atLogin && !this.state.atSignup && !this.state.loginSuccess) {
            return this.loginScreen()
        }
        // ERROR
        else {
            return (
                <View>
                    <Text style={styles.title2}>Something went wrong, try reloading the app</Text>
                </View>
            )
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    {this.manageLogin()}
                </ScrollView>
            </View>

        );
    }
}

export default Login