/* eslint-disable react-native/no-inline-styles */
import React, {Dispatch, FC} from 'react';
import {SpeedDial} from '@rneui/themed';
import {COLORS} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Mode} from '../screens/layer';
import {useNavigation} from '@react-navigation/native';
import {Layer} from '../types';
export const AddFAB: FC<{
  mode: Mode;
  setMode: Dispatch<React.SetStateAction<Mode>>;
  refresh: () => any;
  showEdit: boolean;
  layer: Layer;
}> = ({setMode, showEdit, layer}) => {
  const [open, setOpen] = React.useState(false);
  const navigation = useNavigation();
  return (
    <>
      <SpeedDial
        overlayColor="transparent"
        isOpen={open}
        icon={{name: 'edit', color: '#fff'}}
        openIcon={{name: 'close', color: '#fff'}}
        onOpen={() => setOpen(!open)}
        onClose={() => setOpen(!open)}
        color={COLORS.background}>
        <SpeedDial.Action
          icon={<Icon name="add" color="white" size={20} />}
          buttonStyle={{backgroundColor: 'rgb(40, 200, 64)'}}
          title="Add"
          onPress={() => {
            // @ts-ignore
            navigation.navigate('AddFood', {
              layer,
            });
            setOpen(!open);
          }}
        />
        {showEdit ? (
          <SpeedDial.Action
            icon={<Icon name="delete-forever" color="white" size={20} />}
            buttonStyle={{backgroundColor: 'rgb(255, 95, 87)'}}
            title="Delete"
            onPress={() => {
              setOpen(false);
              setMode('delete');
              setOpen(!open);
            }}
          />
        ) : (
          <></>
        )}
        {showEdit ? (
          <SpeedDial.Action
            icon={<Icon name="auto-delete" color="white" size={20} />}
            buttonStyle={{backgroundColor: 'black'}}
            title="Discard"
            onPress={() => {
              setOpen(false);
              setMode('discard');
              setOpen(!open);
            }}
          />
        ) : (
          <></>
        )}
        {showEdit ? (
          <SpeedDial.Action
            icon={<Icon name="done-all" color="white" size={20} />}
            buttonStyle={{backgroundColor: 'rgb(255, 189, 46)'}}
            title="Exhausted"
            onPress={() => {
              setOpen(false);
              setMode('exhausted');
              setOpen(!open);
            }}
          />
        ) : (
          <></>
        )}
      </SpeedDial>
    </>
  );
};
