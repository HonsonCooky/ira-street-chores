import React, {Component} from "react";
import {Button, HelperText, RadioButton, Text} from "react-native-paper";
import {para1Size, styles} from "../utils/Styles";
import {asyncHelper, renderList, UserContext} from "../utils/Utils";
import {RefreshControl, ScrollView, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {deleteUser, getUser, setUser} from "../BackEndCalls/NetworkingCalls";
import App from "../../App";

interface ps {
    app: App
}

class Settings extends Component<ps> {
    state = {
        name: "",
        isFlatmate: false,
        fmUUID: -1,
        // Can reset
        refresh: false,
        submitUpdates: false,
        newFlatmate: false,
        deleteUserConfirm: false,
        deleteUser: false,
        errMsg: ""
    }

    resetState(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            submitUpdates: false,
            newFlatmate: false,
            deleteUserConfirm: false,
            deleteUser: false,
            errMsg: err ? err : "",
        }
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC
     --------------------------------------------------------------------------------------------------------------*/

    getUserInformation(user: string) {
        if (this.state.name.length === 0 || this.state.refresh) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>User Information</Text>
                    {

                        asyncHelper(() => getUser(user).then(r => {
                            let res = r ? JSON.parse(JSON.stringify(r)) : "";
                            if (Array.isArray(res) && res[0] && res[0].name) {
                                const {name, isFlatmate, fmUUID} = res[0]
                                this.setState({
                                    name: name, isFlatmate: isFlatmate,
                                    newFlatmate: isFlatmate, fmUUID: fmUUID, refresh: false
                                })
                            } else {
                                this.setState(this.resetState("Unable to get user data"))
                            }
                        }).catch(() => {
                            this.setState(this.resetState("Unable to get user data"))
                        }))
                    }
                </View>
            )
        }
        return (
            <View style={styles.component}>
                <Text style={styles.title3}>User Information</Text>
                {renderList([
                    {key: "Name:", value: this.state.name},
                    {key: "UUID:", value: this.state.fmUUID},
                    {key: "Is Flatmate?", value: this.state.isFlatmate.toString()}
                ])}
            </View>
        )
    }


    /**--------------------------------------------------------------------------------------------------------------
     * UPDATE USER
     --------------------------------------------------------------------------------------------------------------*/

    updateUser() {
        return (
            <View style={styles.componentNoBack}>
                <Text style={styles.title4}>Updating</Text>
                {asyncHelper(() => {
                    return getUser(this.state.name).then(() => {
                        setUser(this.state.name, this.state.newFlatmate).then(() => {
                            this.setState(this.resetState("Details Updated", true))
                            this.setState({isFlatmate: this.state.newFlatmate})
                        }).catch(() => this.setState(this.resetState("Unable to update")))
                    }).catch(() => this.setState(this.resetState("Unable to update")))
                })
                }
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * DELETE USER
     --------------------------------------------------------------------------------------------------------------*/

    deleteUserConfirm() {
        return (
            <View style={styles.componentNoBack}>
                <Text style={styles.helpText}>Confirm deletion of {this.state.name}</Text>
                <Button mode={"contained"} style={styles.button3}
                        onPress={() => this.setState({deleteUserConfirm: false, deleteUser: true})}>
                    <Ionicons name={"trash-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Confirm Delete</Text>
                </Button>
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.setState(this.resetState())}>
                    <Ionicons name={"arrow-back-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Go Back</Text>
                </Button>
            </View>
        )
    }

    deleteUser() {
        return (
            <View style={styles.componentNoBack}>
                <Text style={styles.title4}>Deleting {this.state.name}</Text>
                {
                    asyncHelper(() =>
                        deleteUser(this.state.name).then(res => {
                            if (res === 200) {
                                this.props.app.removeState()
                            } else {
                                this.setState(this.resetState(`Unable to delete ${this.state.name} at the moment`))
                            }
                        }).catch(() =>
                            this.setState(this.resetState(`Unable to delete ${this.state.name} at the moment`))))
                }
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * BASE
     --------------------------------------------------------------------------------------------------------------*/

    mainComponent(user: string) {
        return (
            <View>
                {this.getUserInformation(user)}
                <View style={styles.componentNoBack}>
                    <HelperText type="error" visible={this.state.errMsg.length > 0} style={styles.helpText}>
                        {this.state.errMsg}
                    </HelperText>
                    <RadioButton.Item
                        value={"On Press"}
                        status={this.state.newFlatmate ? 'checked' : 'unchecked'}
                        onPress={() => this.setState({newFlatmate: !this.state.newFlatmate, errMsg: ""})}
                        label={"I am a flatmate"}
                        labelStyle={styles.para2}
                        disabled={user === "Admin"}
                    />
                    <Button mode={"contained"} style={styles.button}
                            disabled={user === "Admin"}
                            onPress={() => this.setState({submitUpdates: true})}>
                        <Ionicons name={"arrow-redo-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Update</Text>
                    </Button>
                    <Button mode={"contained"} style={styles.button3}
                            onPress={() => {
                                this.props.app.removeState()
                            }}>
                        <Ionicons name={"log-out-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Sign out</Text>
                    </Button>
                    <Button mode={"contained"} style={styles.button3}
                            disabled={user === "Admin"}
                            onPress={() => {
                                this.setState({deleteUserConfirm: true})
                            }}>
                        <Ionicons name={"trash-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Delete</Text>
                    </Button>
                </View>
            </View>
        )
    }

    manageUserPage(user: string) {
        if (this.state.deleteUserConfirm) {
            return this.deleteUserConfirm();
        } else if (this.state.deleteUser) {
            return this.deleteUser();
        } else if (this.state.submitUpdates) {
            return this.updateUser();
        }
        return (this.mainComponent(user))
    }


    render() {
        return (
            <UserContext.Consumer>
                {value => {
                    return (
                        <View style={styles.container}>
                            <ScrollView refreshControl={
                                <RefreshControl
                                    refreshing={false}
                                    onRefresh={() => {
                                        this.setState({refresh: true})
                                    }}
                                />
                            }>
                                {this.manageUserPage(value)}
                            </ScrollView>
                        </View>
                    )
                }}
            </UserContext.Consumer>
        );
    }
}

export default Settings