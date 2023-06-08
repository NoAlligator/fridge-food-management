import React, {useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {SelectFoodScreen} from '../screens/select-food-screen';
import {Home} from '../screens/home';
import {Setting} from '../screens/settings';
import {ShoppingList} from '../screens/shopping-list-screen';
import {Statistic} from '../screens/statistic';
import {EditFoodScreen} from '../screens/edit-food-screen';
import {PresetFoodScreen} from '../screens/preset-food-screen';
import {MultiEditFoodScreen} from '../screens/multi-edit-food-screen';
import {FilterContext, SearchContext, SortContext, SortType} from '../store';

const Stack = createNativeStackNavigator();

export function Stacks() {
  const filter = useState({
    normal: true,
    nearExpired: true,
    expired: true,
    grouping: true,
  });

  const search = useState('');

  const sort = useState(SortType.NAME);
  return (
    <NavigationContainer>
      <FilterContext.Provider value={filter}>
        <SortContext.Provider value={sort}>
          <SearchContext.Provider value={search}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen
                name="Home"
                component={Home}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddFood"
                component={SelectFoodScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditFood"
                component={EditFoodScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Preset"
                component={PresetFoodScreen}
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
              <Stack.Screen
                name="MultiEdit"
                component={MultiEditFoodScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </SearchContext.Provider>
        </SortContext.Provider>
      </FilterContext.Provider>
    </NavigationContainer>
  );
}
