import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FrozenLayer} from '../screens/frozen-layer';
import {FreshLayer} from '../screens/fresh-layer';
import {NormalLayer} from '../screens/normal-temperature-layer';
import {COLORS} from '../constants';
import {StyleSheet, Text} from 'react-native';
import {FC} from 'react';
const Tab = createMaterialTopTabNavigator();

const fontStyle = StyleSheet.create({
  font: {fontSize: 14, color: 'white'},
});

const CustomLabel: FC<{label: string}> = ({label}) => (
  <Text style={fontStyle.font}>{label}</Text>
);

const Labels = {
  freezing: () => <CustomLabel label="Freezing" />,
  refrigeration: () => <CustomLabel label="Refrigeration" />,
  pantry: () => <CustomLabel label="Pantry" />,
};

export default function Tabs() {
  return (
    <>
      <Tab.Navigator
        initialRouteName="Fresh"
        sceneContainerStyle={{backgroundColor: COLORS.background}}
        style={{
          backgroundColor: COLORS.background,
        }}
        screenOptions={{
          tabBarStyle: {
            backgroundColor: COLORS.background,
            marginLeft: 20,
            marginRight: 20,
            shadowColor: 'rgba(0, 0, 0, 0)',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
            height: 4,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          },
        }}>
        <Tab.Screen
          name="Fresh"
          component={FreshLayer}
          options={{
            tabBarLabel: Labels.refrigeration,
          }}
        />
        <Tab.Screen
          name="Frozen"
          component={FrozenLayer}
          options={{
            tabBarLabel: Labels.freezing,
          }}
        />
        <Tab.Screen
          name="Normal"
          component={NormalLayer}
          options={{
            tabBarLabel: Labels.pantry,
          }}
        />
      </Tab.Navigator>
    </>
  );
}
