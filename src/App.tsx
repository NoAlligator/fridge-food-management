import React from 'react';
import Toast from 'react-native-toast-message';
import {Stacks} from './navigation/stack-navigation';

function App(): JSX.Element {
  return (
    <>
      <Stacks />
      <Toast />
    </>
  );
}

export default App;
