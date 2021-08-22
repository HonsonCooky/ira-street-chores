import React, {Component} from "react";
import {RefreshControl, ScrollView, View} from "react-native";
import {para1Size, styles} from "../utils/Styles";
import {asyncHelper, renderList3, UserContext} from "../utils/Utils";
import {Button, HelperText, Text, TextInput} from "react-native-paper";
import {getBills, writeBill, deleteBill} from "../BackEndCalls/NetworkingCalls";
import {Ionicons} from "@expo/vector-icons";

class Bills extends Component {
    state = {
        dataLoaded: false,
        bills: Array<{ key: string, value: string, value2: string }>(),
        refresh: true,
        company: "",
        amount: "",
        errMsg: ""
    }


    resetState(err?: string, refresh?: boolean) {
        return {
            refresh: !!refresh,
            company: "",
            amount: "",
            errMsg: err ? err : ""
        }
    }

    loadBills() {
        return asyncHelper(() => {
            getBills().then(r => {
                let res = JSON.parse(JSON.stringify(r))
                if (Array.isArray(res)) {
                    let bs = res.map(({company, amount, paidDate}) => {
                        return ({
                            key: company,
                            value: amount,
                            value2: paidDate
                        })
                    })
                    this.setState({
                        dataLoaded: true,
                        refresh: false,
                        bills: bs
                    })
                } else {
                    this.setState({
                        dataLoaded: true,
                        refresh: false,
                        bills: []
                    })
                }
            }).catch(() =>
                this.setState({
                    dataLoaded: true,
                    refresh: false,
                    bills: []
                })
            )
        })
    }

    addBill() {
        return (
            <View style={styles.component}>
                <Text style={styles.title3}>Add Bills</Text>
                <TextInput style={styles.input2}
                           label={'Company'} value={this.state.company}
                           mode={"flat"}
                           onChangeText={t => this.setState({company: t.trim()})}
                />

                <TextInput style={styles.input2}
                           label={'$ Amount'} value={this.state.amount}
                           mode={"flat"}
                           onChangeText={t => this.setState({amount: t.trim()})}
                           keyboardType={"number-pad"}
                           left={<TextInput.Affix text={"$ "} textStyle={styles.para2}/>}
                />
                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.addBillLogic()}>
                    <Ionicons name={"add-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Add Bill</Text>
                </Button>

                <Button mode={"contained"} style={styles.button}
                        onPress={() => this.removeBillLogic()}>
                    <Ionicons name={"trash-outline"} size={para1Size}/>
                    <Text style={styles.para1}> Remove Bill</Text>
                </Button>

                <HelperText type="error" visible={this.state.errMsg.length != 0}
                            style={styles.helpText}>
                    <Text style={styles.para3}>{this.state.errMsg}</Text>
                </HelperText>
            </View>
        )
    }

    addBillLogic() {
        if (isNaN(Number(this.state.amount)))
            this.setState({errMsg: "Amount is not a number"})
        let num = Number(this.state.amount)
        writeBill(this.state.company, num)
            .then(() => {
                this.setState(this.resetState("Saved Bill", true))
            })
            .catch(() => {
                this.setState({errMsg: "Unable to add bill"})
            })
    }

    removeBillLogic() {
        deleteBill(this.state.company)
            .then(() => {
                this.setState(this.resetState("Removed latest Bill", true))
            })
            .catch(() => {
                this.setState({errMsg: "Unable to remove bill"})
            })
    }

    showBills() {
        if (!this.state.dataLoaded || this.state.refresh) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Bills</Text>
                    {this.loadBills()}
                </View>
            )
        } else if (this.state.bills.length > 0) {
            return (
                <View style={styles.component}>
                    <Text style={styles.title3}>Bills</Text>
                    {renderList3(this.state.bills? this.state.bills.reverse() : [])}
                </View>
            )
        }
        return (
            <View style={styles.component}>
                <Text style={styles.title3}>Bills</Text>
                <Text style={styles.para2}>No Bills</Text>
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
                                        this.setState.bind(this)({refresh: true})
                                    }}
                                />
                            }>
                                {this.showBills()}
                                {value === "Admin" && this.addBill()}
                            </ScrollView>
                        </View>
                    )
                }}
            </UserContext.Consumer>
        );
    }
}

export default Bills