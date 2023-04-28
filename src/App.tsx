import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Home} from './screens/home';
import {createStackNavigator} from '@react-navigation/stack';
import {Setting} from './screens/settings';
import {ShoppingList} from './screens/shopping-list';
import {Statistic} from './screens/statistic';
const Stack = createStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Shopping"
          component={ShoppingList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Statistic"
          component={Statistic}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
