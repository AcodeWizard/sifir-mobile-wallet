import * as types from '@types/index';
import {FULFILLED, PENDING, REJECTED} from '@utils/index';
import _btc from '@io/btcClient';
import {getClient, getTransport} from '@io/matrix';
import {Images, C} from '@common/index';
import {rnTorTransport} from '@io/tor/sifirRnTorTransport';
import {
  makeNewPgpKey,
  signMessageWithArmoredKey,
  verifySignedMessage,
} from '@io/pgp/';
let btcClient;

const initBtcClient = () => async (dispatch, getState) => {
  const {
    auth: {token},
  } = getState();

  if (!token) {
    dispatch({
      type: types.BTC_CLIENT_STATUS + REJECTED,
      payload: {error: 'NO TOKEN'},
    });
    return;
  }
  const passphrase = 'keypassphrase from state';
  const onionUrl =
    'http://gt5gt3knblzpaq3mcv2b7lhbh7o3mxh6x3tqw3hqyirwjytuz2gornyd.onion/sifir';
  const {pubKeyArmored: nodePubKey} = await makeNewPgpKey({
    passphrase,
    email: 'poop@nop.com',
    name: 'kaka',
  });
  const deviceKey = await makeNewPgpKey({
    email: 'poop@nop.com',
    name: 'kaka',
    passphrase,
  });
  // const client_matrix = await getClient(token);
  // const transport = await getTransport(client_matrix, token);
  const transport = rnTorTransport({
    verifySigFn: (msg, armoredSignature) =>
      verifySignedMessage({
        armoredSignature,
        msg,
        armoredKey: nodePubKey,
      }),
    signFn: async payload => {
      const {armoredSignature} = await signMessageWithArmoredKey({
        msg: payload,
        passphrase,
        privKey: deviceKey.privKeyArmored,
      });
      return armoredSignature;
    },
    onionUrl,
  });
  try {
    btcClient = await _btc({transport});
  } catch (err) {
    console.error(err);
    dispatch({
      type: types.BTC_CLIENT_STATUS + REJECTED,
      payload: {error: 'Error creating btc client'},
    });
    return;
  }
  dispatch({
    type: types.BTC_CLIENT_STATUS + FULFILLED,
  });

  return btcClient;
};

const getBtcWalletList = () => async dispatch => {
  dispatch({type: types.BTC_WALLET_LIST_DATA_SHOW + PENDING});

  let btcWalletList = [
    {
      label: 'ADD',
      desc: C.STR_WALLET,
      iconURL: Images.icon_add,
      iconClickedURL: Images.icon_add_clicked,
      pageURL: 'AddWallet',
    },
  ];

  try {
    await dispatch(initBtcClient());
    const watchedPub32 = await btcClient.getWatchedPub32();
    watchedPub32.forEach(async ({pub32, label}) =>
      btcWalletList.push({
        pub32,
        label,
        type: C.STR_WATCH_WALLET_TYPE,
        desc: C.STR_WATCH_ONLY,
        iconURL: Images.icon_btcBtn,
        iconClickedURL: Images.icon_btcBtn_clicked,
        pageURL: 'Account',
      }),
    );

    // Add spending walet
    btcWalletList.push({
      label: 'Spending',
      desc: C.STR_WALLET,
      type: C.STR_SPEND_WALLET_TYPE,
      iconURL: Images.icon_btcBtn,
      iconClickedURL: Images.icon_btcBtn_clicked,
      pageURL: 'Account',
    });

    dispatch({
      type: types.BTC_WALLET_LIST_DATA_SHOW + FULFILLED,
      payload: {btcWalletList},
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: types.BTC_WALLET_LIST_DATA_SHOW + REJECTED,
      payload: {error},
    });
  }
};

const getWalletDetails = ({label, type}) => async dispatch => {
  dispatch({type: types.BTC_WALLET_DETAILS + PENDING});

  let balance = 0,
    txnData = [];

  try {
    await dispatch(initBtcClient());
    switch (type) {
      case C.STR_WATCH_WALLET_TYPE:
        [balance, txnData] = await Promise.all([
          btcClient.getBalanceByPub32Label(label),
          btcClient.getTransactionsByPub32Label(label),
        ]);
        break;
      case C.STR_SPEND_WALLET_TYPE:
        [balance, txnData] = await Promise.all([
          btcClient.getBalance(),
          btcClient.getTxnsSpending(),
        ]);
        break;
      default:
        break;
    }
    const btcUnit = C.STR_BTC;
    dispatch({
      type: types.BTC_WALLET_DETAILS + FULFILLED,
      payload: {btcWalletDetails: {balance, txnData, btcUnit}},
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: types.BTC_WALLET_DETAILS + REJECTED,
      payload: {error},
    });
  }
};

const getWalletAddress = ({label, type, addrType = null}) => async dispatch => {
  dispatch({type: types.BTC_WALLET_ADDRESS + PENDING});
  let address = null;

  try {
    await dispatch(initBtcClient());
    switch (type) {
      case C.STR_WATCH_WALLET_TYPE:
        address = await btcClient.getUnusedAddressesByPub32Label(label);
        address = address[0].address;
        break;
      case C.STR_SPEND_WALLET_TYPE:
        address = await btcClient.getNewAddress(addrType);
        break;
      default:
        break;
    }
    dispatch({
      type: types.BTC_WALLET_ADDRESS + FULFILLED,
      payload: {address},
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: types.BTC_WALLET_ADDRESS + REJECTED,
      payload: {error},
    });
  }
};

const sendBitcoin = ({address, amount}) => async dispatch => {
  dispatch({type: types.SEND_BITCOIN + PENDING});
  try {
    if (isNaN(amount)) {
      throw C.STR_AMOUNT_BENUMBER;
    }
    await dispatch(initBtcClient());
    const btcSendResult = await btcClient.spend(address, Number(amount));
    dispatch({
      type: types.SEND_BITCOIN + FULFILLED,
      payload: {btcSendResult},
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: types.SEND_BITCOIN + REJECTED,
      payload: {error},
    });
  }
};

export {
  getWalletDetails,
  getBtcWalletList,
  initBtcClient,
  getWalletAddress,
  sendBitcoin,
};
