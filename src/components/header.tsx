import React from 'react';
import {View, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants';
import {Divider, Tooltip} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';

const headerStyle = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconsContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  logo: {resizeMode: 'contain', width: 100, marginLeft: 10},
  popOverContainer: {padding: 0},
  moreOption: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconStyle: {
    marginRight: 10,
  },
  iconStyle: {
    marginHorizontal: 4,
  },
});

export const Header = () => {
  const navigation = useNavigation();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <View style={headerStyle.container}>
        <Image
          style={headerStyle.logo}
          source={require('../assets/png/logo-en-white.png')} // 引入本地图片
        />
        <View style={headerStyle.iconsContainer}>
          <Icon
            name="shopping-cart"
            size={25}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Shopping');
            }}
          />
          <Icon
            name="bar-chart"
            size={25}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Statistic');
            }}
          />
          <Divider
            orientation="vertical"
            style={{marginVertical: 4, marginHorizontal: 5}}
          />
          <Icon
            name="search"
            size={25}
            color="white"
            style={headerStyle.iconStyle}
          />
          <Icon
            name="filter-alt"
            size={25}
            color="white"
            style={headerStyle.iconStyle}
          />
          <Divider
            orientation="vertical"
            style={{marginVertical: 4, marginHorizontal: 5}}
          />
          <Tooltip
            visible={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            width={100}
            height={80}
            backgroundColor="white"
            skipAndroidStatusBar={true}
            containerStyle={{
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.3,
              shadowRadius: 2,
            }}
            popover={
              <View style={headerStyle.popOverContainer}>
                <TouchableOpacity onPress={() => {}}>
                  <View style={headerStyle.moreOption}>
                    <Text style={{color: 'black'}}>Sort & Filter</Text>
                  </View>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setTimeout(() => {
                      // @ts-ignore
                      navigation.navigate('Setting');
                    });
                  }}>
                  <View style={headerStyle.moreOption}>
                    <Text style={{color: 'black'}}>Setting</Text>
                  </View>
                </TouchableOpacity>
              </View>
            }
            withPointer={false}>
            <Icon
              name="more-vert"
              size={25}
              color="white"
              style={headerStyle.iconStyle}
            />
          </Tooltip>
        </View>
      </View>
    </>
  );
};
