import React, {Component} from "react";
import {RefreshControl, ScrollView, View} from "react-native";
import {para1Size, styles} from "../utils/Styles";
import {deleteChore, getChores, writeChore} from "../BackEndCalls/NetworkingCalls";
import {asyncHelper, renderList, UserContext} from "../utils/Utils";
import {Button, HelperText, Text, TextInput} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";

class Chores extends Component {
    state = {
        dataLoaded: false,
        choresList: new Array<{ key: any, value: any }>(),
        refresh: false,
        errMsg: "",
        errMsg2: "",
        errMsg3: "",
        chore: "",

    }

    resetState(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            chore: "",
            errMsg: "",
            errMsg2: err ? err : "",
            errMsg3: "",
        }
    }

    resetState2(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            chore: "",
            errMsg: "",
            errMsg2: "",
            errMsg3: err ? err : "",
        }
    }


    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC
     --------------------------------------------------------------------------------------------------------------*/

    async loadChores() {
        return await getChores().then(res => {
            this.setState({
                choresList:
                    Object.keys(res).map(k => {
                        return {value: res[k].onDuty, key: res[k].chore}
                    }),
                refresh: false,
                dataLoaded: true
            })
        }).catch(_ => {
            this.setState({errMsg: "Unable to connect to database", refresh: false, dataLoaded: true})
        })
    }

    addChoreLogic() {
        writeChore(this.state.chore).then(res => {
            if (res === 200) {
                this.setState(this.resetState("Chore Added", true))
            } else {
                this.setState(this.resetState("Error in adding chore"))
            }
        }).catch(() => this.setState(this.resetState("Error in adding chore")))
    }


    removeChoreLogic() {
        deleteChore(this.state.chore).then(res => {
            if (res === 200) {
                this.setState(this.resetState("Chore Removed", true))
            } else {
                this.setState(this.resetState("Error in removing chore"))
            }
        }).catch(() => this.setState(this.resetState("Error in removing chore")))
    }

    /**--------------------------------------------------------------------------------------------------------------
     * BASE
     --------------------------------------------------------------------------------------------------------------*/

    addChore() {
        return (
            <View>
                <View style={styles.component}>
                    <Text style={styles.title3}>Add Chore</Text>
                    <TextInput style={styles.input2}
                               label={'Chore'} value={this.state.chore}
                               mode={"flat"}
                               onChangeText={t => this.setState({chore: t.trim()})}
                    />
                    <Button mode={"contained"} style={styles.button}
                            loading={this.state.refresh}
                            onPress={() => this.addChoreLogic()}>
                        <Ionicons name={"add-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Add Chore</Text>
                    </Button>

                    <Button mode={"contained"} style={styles.button}

                            loading={this.state.refresh}
                            onPress={() => this.removeChoreLogic()}>
                        <Ionicons name={"trash-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Remove Chore</Text>
                    </Button>

                    <HelperText type="error" visible={this.state.errMsg2.length != 0}
                                style={styles.helpText}>
                        <Text style={styles.para3}>{this.state.errMsg2}</Text>
                    </HelperText>
                </View>
            </View>
        )

    }

    manageChores(user: string) {
        if (this.state.errMsg.length > 0) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Who's On What?</Text>
                    <Text style={styles.para3}>{this.state.errMsg}</Text>
                </View>

            )
        }

        if (!this.state.dataLoaded || this.state.refresh) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Who's On What?</Text>
                    {asyncHelper(() => {
                        this.loadChores.bind(this)().then(() => this.setState({refresh: false, errMsg: ""}))
                            .catch(() => this.setState({refresh: false, errMsg: "Unable to load chores"}))
                    })}
                </View>
            )
        } else if (this.state.choresList.length > 0) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Who's On What?</Text>
                    {renderList(this.state.choresList, user)}
                </View>
            )
        } else {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Who's On What?</Text>
                    <Text style={styles.para2}>No Chores exist</Text>
                </View>
            )
        }
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
                                        this.setState.bind(this)(this.resetState("", true))
                                    }}
                                />
                            }>
                                <View>
                                    {this.manageChores(value)}
                                    {value === "Admin" && this.addChore()}
                                </View>
                            </ScrollView>
                        </View>
                    )
                }
                }
            </UserContext.Consumer>
        )
    }
}

export default Chores;