import React, {FC, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AlphabetList} from 'react-native-section-alphabet-list';
import {foods} from '../mock/data';
import pinyin from 'pinyin';
import {COLORS} from '../constants';

const CustomAlphabetList: FC<{
  activeCategoryId: number | null;
  filterText: string;
}> = ({activeCategoryId, filterText}) => {
  const inSearch = filterText !== '';
  const filteredFoods = useMemo(() => {
    if (!inSearch) {
      return foods.filter(({category_id}) => category_id === activeCategoryId);
    } else {
      return foods.filter(({name}) => name.includes(filterText));
    }
  }, [activeCategoryId, inSearch, filterText]);

  const foodsToPingyin: {value: string; key: number}[] = useMemo(() => {
    return filteredFoods.map(({name, id}) => ({
      value: pinyin(name, {style: pinyin.STYLE_NORMAL}).join(''),
      key: id,
      displayValue: name,
    }));
  }, [filteredFoods]);

  const renderListItem = (item: any) => {
    console.log(item);
    return (
      <View style={styles.listItemContainer}>
        <Text style={styles.listItemLabel}>{item.displayValue}</Text>
      </View>
    );
  };

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
    </View>
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
