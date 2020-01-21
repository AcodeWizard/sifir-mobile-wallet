import React, {Component} from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {Images, AppStyle, C} from '@common/index';
import {Badge, Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import Swipeout from 'react-native-swipeout';

export default class SifirChatListItem extends Component {
  state = {i: 0};
  swipeoutBtns = [
    {
      backgroundColor: 'black',
      component: (
        <TouchableOpacity style={{flex: 1}}>
          <View style={styles.delImgView}>
            <Image source={Images.icon_recycle} style={styles.delImg} />
          </View>
        </TouchableOpacity>
      ),
    },
  ];

  render() {
    const {data, clickedItem, gColors} = this.props;
    return (
      <Swipeout
        right={this.swipeoutBtns}
        style={styles.swipeout}
        buttonWidth={70}>
        <TouchableOpacity onPress={() => clickedItem(data)}>
          <LinearGradient
            colors={data.selected === false ? gColors[0] : gColors[1]}
            style={styles.chatItem}>
            <Image source={Images.img_face1} style={styles.itemImg} />
            <Badge
              status="success"
              badgeStyle={styles.itemBadge}
              containerStyle={styles.itemBadgeCont}
            />
            <View style={styles.txtItemView}>
              <Text style={styles.nameItemTxt}>{data.title}</Text>
              <Text style={styles.contItemTxt}>{data.cont}</Text>
            </View>
            <View style={styles.timeTxtView}>
              <Text style={styles.timeItem}>{data.timeTxt}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Swipeout>
    );
  }
}

const styles = StyleSheet.create({
  swipeout: {backgroundColor: 'transparent'},
  chatItem: {
    flex: 1,
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    backgroundColor: '#122C3A',
    marginHorizontal: 5,
  },
  consultItem: {
    flex: 1,
    height: 220,
    alignItems: 'center',
    backgroundColor: '#122C3A',
    marginHorizontal: 5,
  },
  itemImg: {
    width: 75,
    height: 75,
    marginTop: 10,
    marginLeft: 10,
  },
  timeItem: {
    fontSize: 10,
    color: 'white',
  },
  rateItem: {
    fontSize: 15,
    color: 'white',
    marginBottom: 5,
  },
  timeTxtView: {
    flex: 0.5,
    height: 50,
    alignItems: 'flex-end',
    marginRight: 5,
  },
  txtItemView: {
    flex: 1,
    marginLeft: 10,
  },
  nameItemTxt: {
    color: AppStyle.mainColor,
    fontSize: 15,
  },
  contItemTxt: {
    color: 'white',
  },
  itemBadge: {
    width: 10,
    height: 10,
  },
  itemBadgeCont: {
    marginLeft: -9,
  },
  delImg: {
    width: 25,
    height: 25,
  },
  delImgView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultStar: {
    flexDirection: 'row',
    backgroundColor: AppStyle.mainColor,
    borderRadius: 5,
    justifyContent: 'space-around',
    width: 55,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    marginLeft: 10,
  },
  payContView: {
    backgroundColor: AppStyle.backgroundColor,
    width: 80 * C.vw,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 15,
    marginTop: 15,
  },
  statusView: {
    borderRadius: 5,
    width: 70,
    alignItems: 'center',
    paddingVertical: 3,
    backgroundColor: 'green',
  },
  infoTxt: {color: 'white', fontStyle: 'italic'},
  payBtnTxt: {color: AppStyle.mainColor, fontSize: 18},
  headView: {flexDirection: 'row', marginTop: 5},
  statusTxt: {color: 'white', fontSize: 13},
  infoView: {marginTop: 10, flex: 0.3},
});
