import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {LayerScreen} from '../screens/layer';
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
  refrigeration: () => <CustomLabel label="Fresh" />,
  freezing: () => <CustomLabel label="Frozen" />,
  pantry: () => <CustomLabel label="Pantry" />,
};

const DEFAULT_ROUTE = 'Fresh';

const FreshLayer = () => <LayerScreen layer={'Fresh'} />;
const FrozenLayer = () => <LayerScreen layer={'Frozen'} />;
const NormalLayer = () => <LayerScreen layer={'Normal'} />;
export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName={DEFAULT_ROUTE}
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
  );
}
