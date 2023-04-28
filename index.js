/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import './src/database/index';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);
