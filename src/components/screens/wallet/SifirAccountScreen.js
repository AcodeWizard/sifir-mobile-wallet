import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {Images, AppStyle, C} from '@common/index';
import {getWalletDetails} from '@actions/btcwallet';
import {getLnWalletDetails} from '@actions/lnWallet';
import {getUnspentCoins, getTxns as wasabiGetTxns} from '@actions/wasabiWallet';
import SifirAccountHeader from '@elements/SifirAccountHeader';
import SifirAccountChart from '@elements/SifirAccountChart';
import SifirAccountActions from '@elements/SifirAccountActions';
import SifirAccountHistory from '@elements/SifirAccountHistory';
import SifirSettingModal from '@elements/SifirSettingModal';
import {ErrorScreen} from '@screens/error';
import debounce from '../../../helpers/debounce';
class SifirAccountScreen extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  state = {
    balance: 0,
    txnData: [],
    unspentCoins: [],
    isVisibleSettingsModal: false,
    anonset: 0,
  };
  stopLoading = null;

  async _loadWalletFromProps() {
    const {label, type} = this.props.route.params.walletInfo;
    switch (type) {
      case C.STR_LN_WALLET_TYPE:
        let {balance, txnData} = await this.props.getLnWalletDetails({label});
        this.setState({balance, txnData});
        break;
      case C.STR_SPEND_WALLET_TYPE:
        let {
          balance: walletBalance,
          txnData: walletTxnData,
        } = await this.props.getWalletDetails({
          label,
          type,
        });
        this.setState({balance: walletBalance, txnData: walletTxnData});
        break;
      case C.STR_WASABI_WALLET_TYPE:
        let [unspentCoins, wasabiTxns] = await Promise.all([
          this.props.getUnspentCoins(),
          this.props.wasabiGetTxns(),
        ]);
        this.setState({txnData: {txnData: wasabiTxns, unspentCoins}});
        //this.setState({
        //  txnData: {
        //    instanceId: null,
        //    transactions: [
        //      {
        //        datetime: '2020-04-23T18:10:36+00:00',
        //        height: 1721643,
        //        amount: 340000,
        //        label: 'mytest',
        //        tx:
        //          '220850ec4d8a8daf6ebe9e74f4ab29ffca3392ff03a081c4915a83cb56b9e0e5',
        //      },
        //      {
        //        datetime: '2020-04-23T18:19:15+00:00',
        //        height: 1721644,
        //        amount: 69,
        //        label: '',
        //        tx:
        //          'cbef19761d3cb0289219558546b9780daf014b4ccaa514b1899f3078b0e9041c',
        //      },
        //      {
        //        datetime: '2020-04-23T19:34:11+00:00',
        //        height: 1721652,
        //        amount: 1000000,
        //        label: 'unknown',
        //        tx:
        //          '555d8c8113a7c279e2187e6d9dbd68d37068dee33107423e4c633861aefd1d4d',
        //      },
        //      {
        //        datetime: '2020-04-23T19:41:43+00:00',
        //        height: 1721654,
        //        amount: -258,
        //        label: 'Test label',
        //        tx:
        //          '2774f213412284720b0f91055aa6e7f605dacd60ead2feb2ff61dd47f90a71b7',
        //      },
        //      {
        //        datetime: '2020-04-23T19:41:43+00:00',
        //        height: 1721654,
        //        amount: -236,
        //        label: 'BY hamza',
        //        tx:
        //          '2e8b72cbc82b54e2610e3dd8a720257dfab1a42df80c883cb54041519446dfc8',
        //      },
        //      {
        //        datetime: '2020-04-23T19:41:43+00:00',
        //        height: 1721654,
        //        amount: -267,
        //        label: '',
        //        tx:
        //          '90cb834af185e3d926e9c91b9ac3f7d6a72bb0a2099d3b8a7e86de9c6020e174',
        //      },
        //    ],
        //  },
        //});
        break;
    }
  }

  componentDidMount() {
    const {_loadWalletFromProps} = this;
    this.stopLoading = this.props.navigation.addListener(
      'focus',
      _loadWalletFromProps.bind(this),
    );
  }

  componentWillUnmount() {
    this.stopLoading();
  }
  toggleSettingsModal() {
    this.setState({isVisibleSettingsModal: !this.state.isVisibleSettingsModal});
  }

  handleReceiveButton = () => {
    const {walletInfo} = this.props.route.params;
    this.props.navigation.navigate('BtcReceiveTxn', {walletInfo});
  };

  handleSendBtn = () => {
    const {walletInfo} = this.props.route.params;
    const {type} = walletInfo;
    const {balance} = this.state;
    if (type === C.STR_LN_WALLET_TYPE) {
      this.props.navigation.navigate('LNPayInvoiceRoute', {
        screen: 'LnScanBolt',
        params: {walletInfo: {...walletInfo, balance}},
      });
    } else {
      this.props.navigation.navigate('GetAddress', {
        walletInfo: {...walletInfo, balance},
      });
    }
  };

  handleChartSlider = data =>
    debounce(
      ({anonset, value}) =>
        this.setState({anonset: Math.floor(anonset), balance: value}),
      3,
    );
  render() {
    const {balance, txnData, anonset} = this.state;
    const {navigate} = this.props.navigation;
    const {walletInfo} = this.props.route.params;
    const {label, type} = walletInfo;
    const {loading, loaded, error: errorBtc} = this.props.btcWallet;
    const {
      loading: loadingLN,
      loaded: loadedLN,
      error: errorLN,
    } = this.props.lnWallet;
    const isLoading = type === C.STR_LN_WALLET_TYPE ? loadingLN : loading;
    const isLoaded = type === C.STR_LN_WALLET_TYPE ? loadedLN : loaded;
    const hasError = type === C.STR_LN_WALLET_TYPE ? errorLN : errorBtc;
    const {toggleSettingsModal} = this;
    // FIXME here or start seperateing comopnents ?
    let accountIcon,
      accountIconOnPress,
      accountHeaderText,
      accountTransactionHeaderText,
      btcUnit,
      chartData = null,
      settingModalProps = {};
    switch (type) {
      case C.STR_LN_WALLET_TYPE:
        accountIcon = Images.icon_light;
        accountIconOnPress = toggleSettingsModal.bind(this);
        accountHeaderText = C.STR_Balance_Channels_n_Outputs;
        accountTransactionHeaderText = C.STR_INVOICES_AND_PAYS;
        settingModalProps = {
          toolTipStyle: false,
          showOpenChannel: true,
          showTopUp: true,
          showWithdraw: true,
        };
        btcUnit = C.STR_MSAT;
        break;
      case C.STR_WASABI_WALLET_TYPE:
        accountIcon = Images.icon_wasabi;
        accountIconOnPress = toggleSettingsModal.bind(this);
        accountHeaderText = C.STR_Wasabi_Header + anonset;
        accountTransactionHeaderText = C.STR_ALL_TRANSACTIONS;
        btcUnit = C.STR_SAT;
        chartData = this.unspentCoins;
        // settingModalProps = {anonsetSettingEnabled: true};
        break;
      default:
        accountHeaderText = C.STR_Cur_Balance;
        accountIcon = Images.icon_bitcoin;
        accountIconOnPress = () => {};
        accountTransactionHeaderText = C.STR_TRANSACTIONS;
        btcUnit = C.STR_BTC;
    }

    if (hasError) {
      return (
        <ErrorScreen
          title={C.STR_ERROR_btc_action}
          desc={C.STR_ERROR_account_screen}
          error={hasError}
          actions={[
            {
              text: C.STR_TRY_AGAIN,
              onPress: () => this._loadWalletFromProps(),
            },
            {
              text: C.STR_GO_BACK,
              onPress: () => navigate('AccountList'),
            },
          ]}
        />
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.SVcontainer}>
        <View style={styles.mainView}>
          <View style={styles.navBtn}>
            <TouchableOpacity>
              <View
                style={styles.backNavView}
                onTouchEnd={() => navigate('AccountList')}>
                <Image source={Images.icon_back} style={styles.backImg} />
                <Text style={styles.backNavTxt}>{C.STR_My_Wallets}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {this.state.isVisibleSettingsModal && (
            <View
              style={styles.settingMenuContainer}
              onTouchEnd={() => {
                toggleSettingsModal.bind(this);
              }}>
              <SifirSettingModal
                hideModal={toggleSettingsModal.bind(this)}
                {...settingModalProps}
                walletInfo={{...walletInfo, balance}}
              />
            </View>
          )}
          <SifirAccountHeader
            accountIcon={accountIcon}
            accountIconOnPress={accountIconOnPress}
            loading={isLoading}
            loaded={isLoaded}
            type={type}
            label={label}
            balance={balance}
            btcUnit={btcUnit}
            headerText={accountHeaderText}
          />
          {chartData && (
            <SifirAccountChart
              chartData={chartData}
              handleChartSlider={this.handleChartSlider()}
            />
          )}

          <SifirAccountActions
            navigate={navigate}
            type={type}
            label={label}
            walletInfo={walletInfo}
            handleReceiveButton={
              // TODO update this when invoices done
              type === C.STR_LN_WALLET_TYPE ? null : this.handleReceiveButton
            }
            handleSendBtn={
              // For now only watching wallets cant send
              type === C.STR_WATCH_WALLET_TYPE ? null : this.handleSendBtn
            }
          />
          <SifirAccountHistory
            loading={isLoading}
            loaded={isLoaded}
            type={type}
            txnData={txnData}
            btcUnit={btcUnit}
            headerText={accountTransactionHeaderText}
          />
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    btcWallet: state.btcWallet,
    lnWallet: state.lnWallet,
    wasabiWallet: state.wasabiWallet,
  };
};

const mapDispatchToProps = {
  getWalletDetails,
  getLnWalletDetails,
  getUnspentCoins,
  wasabiGetTxns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SifirAccountScreen);

const styles = StyleSheet.create({
  navBtn: {flex: 0.7},
  SVcontainer: {
    backgroundColor: AppStyle.backgroundColor,
    flexGrow: 1,
  },
  mainView: {
    flex: 1,
    backgroundColor: '#091110',
    paddingTop: 10,
  },
  backNavView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 7,
    marginLeft: 13,
  },
  backNavTxt: {
    fontFamily: AppStyle.mainFontBold,
    fontSize: 15,
    color: 'white',
    marginLeft: 5,
  },
  backImg: {
    width: 15,
    height: 15,
    marginLeft: 10,
    marginTop: 2,
  },

  satTxt: {
    color: 'white',
    fontSize: 26,
    fontFamily: AppStyle.mainFont,
    textAlignVertical: 'bottom',
    marginBottom: 7,
    marginLeft: 5,
  },
  settingMenuContainer: {
    position: 'absolute',
    paddingTop: 80,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    elevation: 10,
    zIndex: 10,
  },
});
