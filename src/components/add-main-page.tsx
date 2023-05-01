import React, {Dispatch, FC, useRef, useState} from 'react';
import {SearchBar, SpeedDial} from '@rneui/themed';
import {COLORS} from '../constants';
import {Modal, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AddFood} from './food-category-list';
import {Mode} from '../screens/layer';
export const AddFAB: FC<{
  mode: Mode;
  setMode: Dispatch<React.SetStateAction<Mode>>;
  refresh: () => any;
  showEdit: boolean;
}> = ({mode, setMode, refresh, showEdit}) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
  };
  const ref = useRef<any>();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <SpeedDial
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
            setOpen(false);
            setModalVisible(true);
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
            }}
          />
        ) : (
          <></>
        )}
      </SpeedDial>
      {/* <View style={styles.buttonContainer}>
        <Button
          icon={<Icon name="add" size={30} color="white" />}
          buttonStyle={styles.button}
          radius={25}
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View> */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
        hardwareAccelerated
        statusBarTranslucent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Icon
              name="arrow-back"
              size={25}
              color="white"
              onPress={() => setModalVisible(false)}
            />
            <SearchBar
              ref={ref}
              platform="android"
              placeholderTextColor="white"
              placeholder="Search..."
              containerStyle={{
                width: 200,
                backgroundColor: 'transparent',
              }}
              cancelIcon={
                <Icon
                  name="check"
                  size={25}
                  onPress={() => {
                    ref.current && ref.current.blur();
                  }}
                />
              }
              searchIcon={<Icon name="search" size={25} />}
              clearIcon={
                <Icon
                  name="close"
                  size={25}
                  onPress={() => {
                    setSearch('');
                  }}
                />
              }
              onChangeText={updateSearch}
              value={search}
            />
          </View>
          <AddFood filterText={search} />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {position: 'absolute', right: 25, bottom: 20},
  button: {
    padding: 0,
    width: 50,
    height: 50,
    backgroundColor: COLORS.background,
  },
  modalContainer: {
    display: 'flex',
    height: '100%',
  },
  header: {
    height: 50,
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
