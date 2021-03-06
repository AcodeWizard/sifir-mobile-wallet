import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

import {Images, AppStyle, C} from '@common/index';
import {error, log} from '@io/events';
export default class ErrorScreen extends Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {};
  componentDidUpdate(prevProps) {
    if (prevProps.error !== this.props.error) error(error);
  }
  render() {
    const {title, desc, error: passedError, actions} = this.props;
    let printableErrorDetails = null;
    if (passedError) {
      if (passedError instanceof String) {
        printableErrorDetails = passedError;
      } else {
        try {
          // TODO refactor this to helpers
          const cypernodeError = passedError?.err?.err || passedError?.err;
          if (cypernodeError) {
            try {
              printableErrorDetails = JSON.stringify(cypernodeError);
            } catch {}
          }
          // Where we able to parse the error yet ?
          if (!printableErrorDetails) {
            // try generic objec to string conversion
            if (passedError?.toString()) {
              printableErrorDetails = passedError.toString();
            } else {
              printableErrorDetails = JSON.stringify(
                passedError,
                Object.getOwnPropertyNames(passedError),
              );
            }
          }
        } catch (err) {
          error('errorScreen: could not parse error type', err);
        }
      }
    }
    log('ErrorScreen Data', {
      title,
      desc,
      passedError,
      actions,
      printableErrorDetails,
    });

    return (
      <View style={styles.mainView}>
        <View style={styles.mainContent}>
          <Image source={Images.icon_failure} style={styles.checkImg} />
          <Text style={styles._headLine}>{title}</Text>
          <Text style={styles.descriptionTxt}>{desc}</Text>
          <ScrollView>
            <Text style={styles.technicalTxt}>{printableErrorDetails}</Text>
          </ScrollView>
        </View>
        <View style={styles.gridView}>
          {actions && actions.length > 0
            ? actions.map((action, index) => (
                <View id={index} style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.doneTouch}
                    disabled={action?.onPress ? false : true}
                    onPressOut={() => action?.onPress && action.onPress()}>
                    <View
                      shadowColor="black"
                      shadowOffset="30"
                      style={styles.doneView}>
                      <Text style={styles.doneTxt}>{action.text}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    height: '100%',
    backgroundColor: AppStyle.backgroundColor,
    width: '100%',
  },
  gridView: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -25,
    padding: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doneView: {
    flexDirection: 'row',
    height: 9.5 * C.vh,
    backgroundColor: '#53cbc8',
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
  },
  mainContent: {alignItems: 'center', flex: 3, marginTop: 2 * C.vh},
  _headLine: {
    color: 'white',
    fontFamily: AppStyle.mainFont,
    fontSize: 10 * C.vh,
    marginTop: 10,
    textAlign: 'center',
  },
  descriptionTxt: {
    color: AppStyle.mainColor,
    fontSize: 16,
    marginTop: 20,
    fontFamily: AppStyle.mainFontBold,
  },
  technicalTxt: {
    color: AppStyle.mainColor,
    fontSize: 11,
    marginTop: 10,
    fontFamily: AppStyle.mainFontBold,
  },
  doneTouch: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  doneTxt: {
    color: AppStyle.backgroundColor,
    fontWeight: 'bold',
    fontSize: 26,
    marginRight: 15,
  },
  checkImg: {width: 8 * C.vh, height: 8 * C.vh, marginTop: 2 * C.vh},
  progressView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
