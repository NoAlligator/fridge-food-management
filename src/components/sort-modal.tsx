/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import {SortContext, SortType} from '../store';
import {Button, CheckBox} from '@rneui/themed';
import {COLORS} from '../constants';

export const SortModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [sort, setSort] = useContext(SortContext);
  const [_sort, _setSort] = useState(sort);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={{display: 'flex'}}>
            <View>
              <CheckBox
                checked={_sort === SortType.NAME}
                onPress={() => _setSort(SortType.NAME)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                title="Name"
              />
              <CheckBox
                checked={_sort === SortType.START_TIME}
                onPress={() => _setSort(SortType.START_TIME)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                title="Start time"
              />
              <CheckBox
                checked={_sort === SortType.EXPIRED_TIME}
                onPress={() => _setSort(SortType.EXPIRED_TIME)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                title="Expired time"
              />
              <CheckBox
                checked={_sort === SortType.REST_TIME}
                onPress={() => _setSort(SortType.REST_TIME)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                title="Remaining expiry date"
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 20,
              }}>
              <Button
                title="Cancel"
                type="outline"
                titleStyle={{color: COLORS.background}}
                buttonStyle={{borderColor: COLORS.background}}
                onPress={() => {
                  setModalVisible(false);
                }}
              />
              <Button
                title="Save"
                buttonStyle={{
                  marginLeft: 20,
                  backgroundColor: COLORS.background,
                }}
                onPress={() => {
                  setSort(_sort);
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
