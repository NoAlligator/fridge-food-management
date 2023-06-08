/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {FilterContext} from '../store';
import {Button, CheckBox} from '@rneui/themed';
import {COLORS} from '../constants';

export const FilterModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [filter, setFilter] = useContext(FilterContext);
  const [expired, setExpired] = useState(filter.expired);
  const [nearExpire, setNearExpire] = useState(filter.nearExpired);
  const [normal, setNormal] = useState(filter.normal);
  const [group, setGroup] = useState(filter.grouping);
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
              <Text>Filter</Text>
              <CheckBox
                checked={normal}
                onPress={() => {
                  setNormal(!normal);
                }}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Normal"
                checkedColor={COLORS.background}
              />
              <CheckBox
                checked={nearExpire}
                onPress={() => {
                  setNearExpire(!nearExpire);
                }}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Near Expired"
                checkedColor={COLORS.background}
              />
              <CheckBox
                checked={expired}
                onPress={() => {
                  setExpired(!expired);
                }}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Expired"
                checkedColor={COLORS.background}
              />
              <CheckBox
                checked={normal && nearExpire && expired}
                onPress={() => {
                  const ret = !(normal && nearExpire && expired);
                  setExpired(ret);
                  setNormal(ret);
                  setNearExpire(ret);
                }}
                checkedColor={COLORS.background}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Select All"
              />
            </View>
            <View>
              <Text>Grouping</Text>
              <CheckBox
                checked={group}
                onPress={() => {
                  setGroup(!group);
                }}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                title="Group by category"
                checkedColor={COLORS.background}
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
                  setFilter({
                    expired: expired,
                    normal: normal,
                    nearExpired: nearExpire,
                    grouping: group,
                  });
                  console.log({
                    expired: expired,
                    normal: normal,
                    nearExpired: nearExpire,
                    grouping: group,
                  });
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
