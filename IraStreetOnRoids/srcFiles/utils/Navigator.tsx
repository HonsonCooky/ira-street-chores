import React, {Component} from "react";
import {NavigationContainer, Theme} from "@react-navigation/native";
import Chores from "../pages/Chores";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {themeColors} from "./Styles";
import {UserContext} from "./Utils";
import Settings from "../pages/Settings";
import App from "../../App";
import Shopping from "../pages/Shopping";
import Bills from "../pages/Bills";

interface ps {
    user: string,
    app: App
}

export const Drawer = createDrawerNavigator();

const NavTheme: Theme = {
    dark: false,
    colors: {
        primary: themeColors.text1,
        background: 'rgb(242, 242, 242)',
        card: themeColors.text4,
        text: themeColors.text2,
        border: 'rgb(199, 199, 204)',
        notification: 'rgb(255, 69, 58)',
    },
};

class Navigator extends Component<ps, any> {

    render() {
        return (
            <UserContext.Consumer>
                {() => {
                    return (
                        <NavigationContainer theme={NavTheme}>
                            <Drawer.Navigator initialRouteName="Chores">
                                <Drawer.Screen
                                    name="Chores"
                                    component={Chores}
                                />
                                <Drawer.Screen
                                    name="Shopping"
                                    component={Shopping}
                                />
                                <Drawer.Screen
                                    name="Bills"
                                    component={Bills}
                                />
                                <Drawer.Screen
                                    name="Settings"
                                    children={() => { return (<Settings app={this.props.app}/>)}}
                                />
                            </Drawer.Navigator>
                        </NavigationContainer>
                    )
                }}
            </UserContext.Consumer>
        );
    }
}

export default Navigator