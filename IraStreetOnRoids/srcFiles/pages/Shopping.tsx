import React, {Component} from "react";
import {asyncHelper, renderList2, renderTasks, UserContext} from "../utils/Utils";
import {Button, HelperText, RadioButton, Text, TextInput} from "react-native-paper";
import {RefreshControl, ScrollView, View} from "react-native";
import {para1Size, styles} from "../utils/Styles";
import {getData, storeData, StoreKey} from "../BackEndCalls/AsyncStorage";
import {Ionicons} from "@expo/vector-icons";
import {
    purchaseFlatShopping, getFlatHistory,
    getFlatShopping,
    getUser,
    updatePersonalShopping,
    writeFlatShopping
} from "../BackEndCalls/NetworkingCalls";

class Shopping extends Component {
    state = {
        dataLoaded: false,
        flatHistoryLoaded: false,
        forFlat: false,
        name: "",
        personalShopping: Array<{ key: string, value: boolean }>(),
        flatShopping: Array<{ key: string, value: boolean }>(),
        flatHistoryList: Array<{ key: string, value: string, value2: string }>(),
        refresh: false,
        // Can edit
        selectAllPersonal: true,
        selectAllFlat: true,
        numOfHistory: 5,
        addItem: false,
        setItem: false,
        deletePersonalItems: false,
        deleteFlatItems: false,
        uploadPersonalItems: false,
        downloadPersonalItems: false,
        flatHistory: false,
        selectedPersonal: 0,
        selectedFlat: 0,
        errMsg: "",
        errMsg2: "",
        text: ""
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC
     --------------------------------------------------------------------------------------------------------------*/

    resetState(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            selectAllPersonal: true,
            selectAllFlat: true,
            numOfHistory: 5,
            addItem: false,
            setItem: false,
            deletePersonalItems: false,
            uploadPersonalItems: false,
            downloadPersonalItems: false,
            flatHistory: false,
            deleteFlatItems: false,
            errMsg: err ? err : "",
            errMsg2: "",
            text: ""
        }
    }

    resetState2(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            selectAllPersonal: true,
            selectAllFlat: true,
            numOfHistory: 5,
            addItem: false,
            setItem: false,
            deletePersonalItems: false,
            uploadPersonalItems: false,
            downloadPersonalItems: false,
            flatHistory: false,
            deleteFlatItems: false,
            errMsg2: err ? err : "",
            errMsg: "",
            text: ""
        }
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC - ADD / DELETE
     --------------------------------------------------------------------------------------------------------------*/

    addItemLogic() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    if (!this.state.forFlat) {
                        let ps = this.state.personalShopping ? this.state.personalShopping : new Array<{ key: string, value: boolean }>()
                        if (ps.find((o) => o.key === this.state.text)) {
                            return this.setState(this.resetState(`Already added item ${this.state.text}`))
                        }

                        ps.push({key: this.state.text, value: false})

                        storeData(StoreKey.PersonalShopping, ps).then(res => {
                            if (!res) {
                                this.setState(this.resetState("Unable to add item, (Storage Error)"))
                            } else {
                                this.setState(this.resetState("", true))
                            }

                        }).catch(() => this.setState(this.resetState("Unable to add item, (Storage Error)")))
                    }

                    // FLAT SHOPPING
                    else {
                        let fs = this.state.flatShopping ? this.state.flatShopping : new Array<{ key: string, value: boolean }>()
                        if (fs.find((o) => o.key === this.state.text)) {
                            return this.setState(this.resetState2(`Already added item ${this.state.text}`))
                        }

                        fs.push({key: this.state.text, value: false})
                        writeFlatShopping(this.state.text)
                            .then(() => {
                                this.setState(this.resetState2())
                            })
                            .catch(() => {
                                this.setState(this.resetState2("Unable to add flat shopping"))
                            })
                    }
                })}
            </View>
        )
    }

    deletePersonalItemsLogic() {
        return (
            <View style={styles.component}>
                {asyncHelper(() => {
                    let ps = this.state.personalShopping ? this.state.personalShopping : new Array<{ key: string, value: boolean }>()
                    ps = ps.filter(({value}) => !value)
                    this.setState({selectedPersonal: 0, selectedFlat: 0})
                    storeData(StoreKey.PersonalShopping, ps).then(res => {
                        if (!res)
                            this.setState(this.resetState("Unable to some delete item"))
                        else
                            this.setState(this.resetState("", true))
                    }).catch(() => this.setState(this.resetState("Unable to some delete item")))
                })}
            </View>
        )
    }

    deleteFlatItemsLogic() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    let fs = this.state.flatShopping ? this.state.flatShopping : new Array<{ key: string, value: boolean }>()
                    if (fs.length === 0) {
                        return this.setState(this.resetState2())
                    }


                    let fss = fs.filter(({value}) => value).map(({key}) => key)
                    this.setState({selectedPersonal: 0, selectedFlat: 0})
                    if (fs.length === 0) return this.setState(this.resetState2())
                    purchaseFlatShopping(this.state.name, fss)
                        .then(res => {
                            if (res === 200)
                                this.setState(this.resetState2("", true))
                            else
                                this.setState(this.resetState2(`Unable to delete flat items`, true))
                        })
                        .catch(() => {
                            this.setState(this.resetState2(`Unable to delete flat items`, true))
                        })
                })}
            </View>
        )
    }

    selectAll(l: Array<{ key: string, value: boolean }>, isPersonal: boolean) {

        if (isPersonal)
            this.setState({selectedPersonal: l.length})
        else
            this.setState({selectedFlat: l.length})

        return l.map(({key}) => {
            return {
                key: key,
                value: true
            }
        })
    }

    deselectAll(l: Array<{ key: string, value: boolean }>, isPersonal: boolean) {
        if (isPersonal)
            this.setState({selectedPersonal: 0})
        else
            this.setState({selectedFlat: 0})

        return l.map(({key}) => {
            return {
                key: key,
                value: false
            }
        })
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC - UPLOAD / DOWNLOAD
     --------------------------------------------------------------------------------------------------------------*/

    uploadItems() {
        return (
            <View style={styles.componentNoBack}>
                <Text style={styles.title4}>Uploading shopping</Text>
                {asyncHelper(() => {
                    let list = this.state.personalShopping.map(({key}) => key)
                    updatePersonalShopping(this.state.name, list)
                        .then((res) => {
                                if (res === 200) {
                                    this.setState(this.resetState("Uploaded", true))
                                } else
                                    this.setState(this.resetState("Unable to upload personal list"))
                            }
                        )
                        .catch(() => {
                            this.setState(this.resetState("Unable to upload personal list"))
                        })
                })}
            </View>
        )
    }

    downloadItems() {
        return (
            <View style={styles.componentNoBack}>
                <Text style={styles.title4}>Downloading shopping</Text>
                {asyncHelper(() => {
                    getUser(this.state.name)
                        .then(r => {
                            let res = r ? JSON.parse(JSON.stringify(r)) : "";
                            if (Array.isArray(res) && res[0] && res[0].personalShoppingList) {
                                const {personalShoppingList} = res[0]
                                let list = personalShoppingList.map((s: string) => {
                                    return {key: s, value: false}
                                })
                                list = list ? list.concat(this.state.personalShopping) : this.state.personalShopping
                                this.setState(this.resetState("Shopping downloaded"))
                                this.setState({personalShopping: list})
                            } else {
                                this.setState(this.resetState("Unable to get user data"))
                            }
                        })
                        .catch(() => {
                            this.setState(this.resetState("Unable to get shopping"))
                        })
                })}
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * LOGIC - LOAD
     --------------------------------------------------------------------------------------------------------------*/

    loadPersonal() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    getData(StoreKey.PersonalShopping)
                        // Load personal shopping
                        .then(res => {
                            let ps = res ? JSON.parse(res) : new Array<{ key: string, value: boolean }>()
                            getData(StoreKey.UserName).then(r => {
                                let res = r ? JSON.parse(r) : "";
                                if (Array.isArray(res) && res[0] && res[0].name) {
                                    const {name} = res[0]
                                    this.setState({name: name, personalShopping: ps, dataLoaded: true, refresh: false})
                                } else {
                                    this.setState(this.resetState("Unable to get user data"))
                                }
                            }).catch(() => this.setState(this.resetState("Unable to get user data")))
                        }).catch(() => this.setState(this.resetState("Unable to get user data")))
                })}
            </View>
        )
    }

    loadFlat() {
        return (
            <View style={styles.componentNoBack}>
                {asyncHelper(() => {
                    getFlatShopping()
                        .then((r) => {
                            let res = JSON.parse(JSON.stringify(r))
                            if (Array.isArray(res)) {
                                let fs = res.map(s => {
                                    return ({key: s.item.toString(), value: false})
                                })
                                this.setState({flatShopping: fs, dataLoaded: true, refresh: false})
                            } else {
                                this.setState(this.resetState2("Unable to get flat information"))
                            }
                        }).catch(() => this.setState(this.resetState2("Unable to get flat information")))
                }, "No Indicator")}
            </View>)
    }


    loadShopping() {
        return (
            <View>
                {this.loadPersonal()}
                {this.loadFlat()}
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * PERSONAL SHOPPING
     --------------------------------------------------------------------------------------------------------------*/

    showPersonalShopping(user: string) {

        return (
            <View>
                <View style={styles.component}>
                    <Text style={styles.title3}>{user}'s Shopping List</Text>
                    {renderTasks(this.state.personalShopping, (s: string) => {
                        let ps = this.state.personalShopping
                        let item = ps.filter(({key}) => {
                            return key === s
                        })[0]
                        item.value = !item.value
                        let i = ps.indexOf(item)
                        ps[i] = item
                        this.setState({
                            personalShopping: ps, errMsg: "",
                            selectedPersonal: item.value ? this.state.selectedPersonal + 1 : this.state.selectedPersonal - 1
                        })
                    })}

                    <HelperText type="error" visible={this.state.errMsg.length != 0}
                                style={styles.helpText}>
                        <Text style={styles.para3}>{this.state.errMsg}</Text>
                    </HelperText>

                    {/*Add Delete*/}
                    <View style={styles.componentNoBackRow}>
                        <Button mode={"contained"} style={styles.buttonRow}
                                onPress={() => this.setState({addItem: true, errMsg: "", errMsg2: ""})}>
                            <Ionicons name={"add-outline"} size={para1Size}/>
                            <Text style={styles.para1}> Add</Text>
                        </Button>
                        <Button mode={"contained"} style={styles.buttonRow2}
                                onPress={() => this.setState({deletePersonalItems: true})}>
                            <Ionicons name={"trash-outline"} size={para1Size}/>
                            <Text style={styles.para1}> Del [{this.state.selectedPersonal}]</Text>
                        </Button>
                    </View>
                    <View style={styles.componentNoBack}>
                        <Button mode={"contained"} style={styles.button2}
                                onPress={() => this.setState({
                                    personalShopping: this.state.selectAllPersonal ?
                                        this.selectAll(this.state.personalShopping, true)
                                        : this.deselectAll(this.state.personalShopping, true),
                                    selectAllPersonal: !this.state.selectAllPersonal
                                })}>
                            <Ionicons name={"checkmark-done-outline"} size={para1Size}/>
                            <Text style={styles.para1}> {
                                this.state.selectAllPersonal ? " Select All" : " Deselect All"
                            }</Text>
                        </Button>
                    </View>
                </View>

            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * FLAT SHOPPING
     --------------------------------------------------------------------------------------------------------------*/

    showFlatShopping() {
        return (
            <View>
                <View style={styles.component}>
                    <Text style={styles.title3}>Flat Shopping List</Text>
                    {renderTasks(this.state.flatShopping, (s: string) => {
                        let ps = this.state.flatShopping
                        let item = ps.filter(({key}) => {
                            return key === s
                        })[0]
                        item.value = !item.value
                        let i = ps.indexOf(item)
                        ps[i] = item
                        this.setState({
                            flatShopping: ps, errMsg: "",
                            selectedFlat: item.value ? this.state.selectedFlat + 1 : this.state.selectedFlat - 1
                        })
                    })}

                    <HelperText type="error" visible={this.state.errMsg2.length != 0}
                                style={styles.helpText}>
                        <Text style={styles.para3}>{this.state.errMsg2}</Text>
                    </HelperText>

                    {/*Add Delete*/}
                    <View style={styles.componentNoBackRow}>
                        <Button mode={"contained"} style={styles.buttonRow}
                                onPress={() => this.setState({addItem: true})}>
                            <Ionicons name={"add-outline"} size={para1Size}/>
                            <Text style={styles.para1}> Add</Text>
                        </Button>
                        <Button mode={"contained"} style={styles.buttonRow2}
                                onPress={() => this.setState({deleteFlatItems: true})}>
                            <Ionicons name={"trash-outline"} size={para1Size}/>
                            <Text style={styles.para1}> Del [{this.state.selectedFlat}]</Text>
                        </Button>
                    </View>
                    <View style={styles.componentNoBack}>
                        <Button mode={"contained"} style={styles.button2}
                                onPress={() => this.setState({
                                    flatShopping: this.state.selectAllFlat ?
                                        this.selectAll(this.state.flatShopping, false)
                                        : this.deselectAll(this.state.flatShopping, true),
                                    selectAllFlat: !this.state.selectAllFlat
                                })}>
                            <Ionicons name={"checkmark-done-outline"} size={para1Size}/>
                            <Text style={styles.para1}> {
                                this.state.selectAllFlat ? " Select All" : " Deselect All"
                            }</Text>
                        </Button>
                    </View>
                    <View style={styles.componentNoBack}>
                        <Button mode={"contained"} style={styles.button2}
                                onPress={() => this.setState({flatHistory: true})}>
                            <Ionicons name={"list-outline"} size={para1Size}/>
                            <Text style={styles.para1}> History</Text>
                        </Button>
                    </View>
                </View>

            </View>
        )
    }


    /**--------------------------------------------------------------------------------------------------------------
     * UPLOAD/DOWNLOAD
     --------------------------------------------------------------------------------------------------------------*/

    uploadDownload() {
        return (
            <View>
                {/*Upload Download*/}
                <View style={styles.component}>
                    <Text style={styles.title3}>Upload/Download Personal</Text>
                    <Button mode={"contained"} style={styles.button2}
                            onPress={() => this.setState({uploadPersonalItems: true})}>
                        <Ionicons name={"cloud-upload-outline"} size={para1Size}/>
                        <Text style={styles.para2Light}> Upload personal list</Text>
                    </Button>
                    <Button mode={"contained"} style={styles.button2}
                            onPress={() => this.setState({downloadPersonalItems: true})}>
                        <Ionicons name={"cloud-download-outline"} size={para1Size}/>
                        <Text style={styles.para2Light}> Download personal list</Text>
                    </Button>
                </View>
            </View>
        )
    }

    /**--------------------------------------------------------------------------------------------------------------
     * BASE
     --------------------------------------------------------------------------------------------------------------*/

    addItem() {
        return (
            <View>
                <View style={styles.componentNoBack}>
                    <TextInput style={styles.input}
                               label={'Item'} value={this.state.text}
                               mode={"flat"}
                               onChangeText={t => this.setState({text: t})}
                    />

                    <RadioButton.Item
                        value={"On Press"}
                        status={this.state.forFlat ? 'checked' : 'unchecked'}
                        onPress={() => this.setState({forFlat: !this.state.forFlat})}
                        label={"For flat"}
                        labelStyle={styles.para2}
                    />

                    {/*add item*/}
                    <Button mode={"contained"} style={styles.button}
                            onPress={() => this.setState({setItem: true})}>
                        <Ionicons name={"add-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Add item</Text>
                    </Button>

                    {/*go back*/}
                    <Button mode={"contained"} style={styles.button}
                            onPress={() => this.setState(this.resetState())}>
                        <Ionicons name={"arrow-back-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Go Back</Text>
                    </Button>

                    <HelperText type="error" visible={this.state.errMsg.length != 0}
                                style={styles.helpText}>
                        <Text style={styles.para3}>{this.state.errMsg}</Text>
                    </HelperText>
                </View>
            </View>
        )
    }

    loadFlatHistory() {
        if (!this.state.flatHistoryLoaded || this.state.refresh) {
            return (
                <View>
                    <Text style={styles.title4}>Flat Shopping History:</Text>
                    {asyncHelper(() => {
                        getFlatHistory()
                            .then(r => {
                                let res = JSON.parse(JSON.stringify(r))
                                if (Array.isArray(res) && res[0]) {
                                    let list = res.map((s) => {
                                        return {
                                            key: s.item,
                                            value: s.purchasedBy,
                                            value2: s.purchasedDate
                                        }
                                    }).reverse()

                                    this.setState({
                                        flatHistoryLoaded: true,
                                        refresh: false,
                                        flatHistoryList: list
                                    })
                                } else {
                                    this.setState({
                                        flatHistoryLoaded: true,
                                        refresh: false,
                                        flatHistoryList: []
                                    })
                                }
                            }).catch(() =>
                            this.setState({
                                flatHistoryLoaded: true,
                                refresh: false,
                                flatHistoryList: []
                            }))
                    })}
                </View>
            )
        } else if (this.state.flatHistoryList.length > 0) {
            return (
                <View>
                    <Text style={styles.title4}>Flat Shopping History:</Text>
                    {renderList2(this.state.flatHistoryList, this.state.numOfHistory)}
                </View>

            )
        }
        return (
            <View>
                <Text style={styles.title4}>Flat Shopping History:</Text>
                <Text style={styles.para2}>No history</Text>
            </View>

        )
    }

    flatHistory() {
        return (
            <View>
                <View style={styles.component}>
                    {this.loadFlatHistory()}
                    {/*loadMore*/}
                    <Button mode={"contained"} style={styles.button}
                            onPress={() => this.setState({numOfHistory: this.state.numOfHistory + 5})}>
                        <Ionicons name={"add-outline"} size={para1Size}/>
                        <Text style={styles.para1}> View More</Text>
                    </Button>

                    {/*go back*/}
                    <Button mode={"contained"} style={styles.button}
                            onPress={() => this.setState(this.resetState())}>
                        <Ionicons name={"arrow-back-outline"} size={para1Size}/>
                        <Text style={styles.para1}> Go Back</Text>
                    </Button>
                </View>
            </View>
        )
    }

    manageShopping(user: string) {
        if (!this.state.dataLoaded || this.state.refresh && !this.state.flatHistory) {
            return this.loadShopping()
        } else if (this.state.setItem) {
            return this.addItemLogic()
        } else if (this.state.addItem) {
            return this.addItem()
        } else if (this.state.deletePersonalItems) {
            return this.deletePersonalItemsLogic()
        } else if (this.state.deleteFlatItems) {
            return this.deleteFlatItemsLogic()
        } else if (this.state.uploadPersonalItems) {
            return this.uploadItems()
        } else if (this.state.downloadPersonalItems) {
            return this.downloadItems()
        } else if (this.state.flatHistory) {
            return this.flatHistory()
        }

        return (
            <View>
                {this.showPersonalShopping(user)}
                {this.showFlatShopping()}
                {this.uploadDownload()}
            </View>
        )
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
                                {this.manageShopping(value)}
                            </ScrollView>
                        </View>
                    )
                }}
            </UserContext.Consumer>
        );
    }
}

export default Shopping