import React, {FC, useRef, useState} from 'react';
import {Button, SearchBar} from '@rneui/themed';
import {COLORS} from '../constants';
import {Modal, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AddFood} from './add-food';
export const AddFAB: FC<{}> = ({}) => {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const updateSearch = (value: string) => {
    setSearch(value);
  };
  const ref = useRef<any>();
  return (
    <>
      <View style={styles.buttonContainer}>
        <Button
          icon={<Icon name="add" size={30} color="white" />}
          buttonStyle={styles.button}
          radius={25}
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>
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
