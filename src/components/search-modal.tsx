/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import {TextInput} from '@react-native-material/core';
import {Button} from '@rneui/themed';
import {COLORS} from '../constants';
import {SearchContext} from '../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
export const SearchModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [search, setSearch] = useContext(SearchContext);
  const [value, onChangeText] = React.useState(search);
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
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TextInput
                inputContainerStyle={{width: 200}}
                onChangeText={text => onChangeText(text)}
                value={value}
              />
              <Icon
                name="cancel"
                size={25}
                style={{marginLeft: 10}}
                onPress={() => {
                  onChangeText('');
                }}
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
                  setSearch(value);
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
