import React, {FC, useContext, useMemo, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AlphabetList} from 'react-native-section-alphabet-list';
import pinyin from 'pinyin';
import {COLORS} from '../constants';
import {FoodItem} from '../types';
import {getAllItemsByCategoryId, getAllItemsByKeyword} from '../database/query';
import {useAsyncEffect} from 'ahooks';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Button} from '@rneui/themed';
import {ItemAdd} from './item-add';
import {LayerContext} from '../store';
const Item = ({item}: {item: any}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <View style={styles.listItemContainer}>
          <Text style={styles.listItemLabel}>{item.displayValue}</Text>
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        hardwareAccelerated>
        <View style={modalStyle.modalContainer}>
          <View style={modalStyle.modal}>
            <View style={modalStyle.header}>
              <Icon
                name="arrow-back"
                size={25}
                color="white"
                onPress={() => setVisible(false)}
              />
            </View>
            <ItemAdd
              setVisible={setVisible}
              categoryId={item.categoryId}
              categoryName={item.categoryName}
              itemName={item.displayValue}
              itemId={item.key}
              defaultLifeSpan={item.defaultLifeSpan}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const modalStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    display: 'flex',
    height: '100%',
  },
  modal: {
    backgroundColor: '#ffffff',
    width: '100%',
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

const CustomAlphabetList: FC<{
  activeCategoryId: number | null;
  filterText: string;
}> = ({activeCategoryId, filterText}) => {
  const inSearch = filterText !== '';
  const [items, setItems] = useState<FoodItem[]>([]);
  const layer = useContext(LayerContext);
  useAsyncEffect(async () => {
    if (!inSearch) {
      return;
    }
    const data = await getAllItemsByKeyword(filterText);
    setItems(data as any);
  }, [inSearch]);
  useAsyncEffect(async () => {
    if (activeCategoryId === null || inSearch) {
      return;
    }
    const data = await getAllItemsByCategoryId(activeCategoryId);
    setItems(data as any);
  }, [activeCategoryId, inSearch]);
  const foodsToPingyin: {value: string; key: number}[] = useMemo(() => {
    return items.map(
      ({
        name,
        id,
        category_id,
        category_name,
        fresh_persist_time,
        frozen_persist_time,
        normal_persist_time,
      }) => {
        return {
          value: pinyin(name, {style: pinyin.STYLE_NORMAL}).join(''),
          key: id,
          displayValue: name,
          categoryId: category_id,
          categoryName: category_name,
          defaultLifeSpan:
            layer === 'Fresh'
              ? fresh_persist_time
              : layer === 'Frozen'
              ? frozen_persist_time
              : layer === 'Normal'
              ? normal_persist_time
              : null,
        };
      },
    );
  }, [items, layer]);

  const renderListItem = (item: any) => <Item item={item} />;

  const renderSectionHeader = (section: any) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
      </View>
    );
  };

  const renderCustomListHeader = () => {
    return (
      <View style={styles.listHeaderContainer}>
        <Text>List Header</Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <AlphabetList
          style={styles.alphabetList}
          data={foodsToPingyin as any}
          renderCustomItem={renderListItem}
          renderCustomSectionHeader={renderSectionHeader}
          renderCustomListHeader={renderCustomListHeader}
          getItemHeight={() => sizes.itemHeight}
          sectionHeaderHeight={sizes.headerHeight}
          listHeaderHeight={sizes.listHeaderHeight}
          indexLetterStyle={{
            color: 'black',
          }}
        />
        {activeCategoryId === null ? null : (
          <View style={{position: 'absolute', right: 25, bottom: 25}}>
            <Button
              icon={<Icon name="add" size={30} color="white" />}
              radius={25}
              buttonStyle={{
                padding: 0,
                width: 50,
                height: 50,
              }}
              color={COLORS.background}
            />
          </View>
        )}
      </View>
    </>
  );
};

const sizes = {
  itemHeight: 40,
  headerHeight: 30,
  listHeaderHeight: 0,

  spacing: {
    small: 10,
    regular: 15,
    large: 20,
  },
};

const colors = {
  separatorLine: '#e6ebf2',
  primary: '#007aff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },

  alphabetList: {
    flex: 1,
  },

  listItemContainer: {
    flex: 1,
    height: sizes.itemHeight,
    paddingHorizontal: sizes.spacing.regular,
    justifyContent: 'center',
    borderTopColor: colors.separatorLine,
    borderTopWidth: 1,
  },

  listItemLabel: {
    color: 'black',
    fontSize: 14,
  },

  sectionHeaderContainer: {
    height: sizes.headerHeight,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: sizes.spacing.regular,
  },

  sectionHeaderLabel: {
    color: 'white',
  },

  listHeaderContainer: {
    height: sizes.listHeaderHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomAlphabetList;
