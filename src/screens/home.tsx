import React from 'react';
import {Header} from '../components/header';
import Tabs from '../navigation/tab-navigation';
// import {AddFAB} from '../components/add-fab';
import {StatusBar} from 'react-native';
import {COLORS} from '../constants';

export const Home = () => (
  <>
    <StatusBar backgroundColor={COLORS.background} translucent={false} />
    <Header />
    <Tabs />
    {/* <AddFAB /> */}
  </>
);
