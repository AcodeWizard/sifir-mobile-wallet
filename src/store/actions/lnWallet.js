import * as types from '@types/';
import {FULFILLED, PENDING, REJECTED} from '@utils/constants';
import _ln from '@io/lnClient';
import {Images, C} from '@common/index';
import {getTransportFromToken} from '@io/transports';
import {log, error} from '@io/events/';
let lnClient;

const initLnClient = () => async (dispatch, getState) => {
  if (!lnClient) {
    log('btcWallet:starting btc client');
    const {
      auth: {token, key, nodePubkey, devicePgpKey},
    } = getState();

    if (!token || !key || !nodePubkey) {
      throw 'Unable to init btc client';
    }
    const transport = await getTransportFromToken({
      token,
      nodePubkey,
      devicePgpKey,
    });
    lnClient = await _ln({transport});
  }
  return lnClient;
};

const getLnNodeInfo = () => async dispatch => {
  dispatch({type: types.LN_WALLET_NODEINFO + PENDING});
  await dispatch(initLnClient());
  try {
    const nodeInfo = await lnClient.getNodeInfo();
    dispatch({type: types.LN_WALLET_NODEINFO + FULFILLED, payload: {nodeInfo}});
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_NODEINFO + REJECTED,
      payload: {error: err},
    });
  }
};

const getLnWalletDetails = () => async dispatch => {
  dispatch({type: types.LN_WALLET_DETAILS + PENDING});
  try {
    await dispatch(initLnClient());
    const [{channels, outputs}, invoices] = await Promise.all([
      lnClient.listFunds(),
      lnClient.getInvoice(),
    ]);
    const inChannelBalance = channels.reduce((balance, {channel_sat}) => {
      balance += channel_sat;
      return balance;
    }, 0);
    const outputBalance = outputs.reduce((balance, {value}) => {
      balance += value;
      return balance;
    }, 0);

    dispatch({
      type: types.LN_WALLET_DETAILS + FULFILLED,
    });
    return {inChannelBalance, outputBalance, invoices};
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_DETAILS + REJECTED,
      payload: {error: err},
    });
  }
};

const getFunds = () => async dispatch => {
  dispatch({type: types.LN_WALLET_GET_FUNDS + PENDING});
  try {
    await dispatch(initLnClient());
    const {channels, outputs} = lnClient.listFunds();
    dispatch({
      type: types.LN_WALLET_GET_FUNDS + FULFILLED,
      payload: {channels, outputs},
    });
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_GET_FUNDS + REJECTED,
      payload: {error: err},
    });
  }
};

const decodeBolt = bolt11 => async dispatch => {
  dispatch({type: types.LN_WALLET_DECODE_BOLT + PENDING});
  try {
    await dispatch(initLnClient());
    const invoice = await lnClient.decodeBolt(bolt11);
    dispatch({
      type: types.LN_WALLET_DECODE_BOLT + FULFILLED,
      payload: invoice,
    });
    return invoice;
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_DECODE_BOLT + REJECTED,
      payload: {error: err},
    });
  }
};

const getRoute = (nodeId, msatoshi) => async dispatch => {
  dispatch({type: types.LN_WALLET_GET_ROUTE + PENDING});
  try {
    await dispatch(initLnClient());
    console.log('(nodeId------', nodeId);
    console.log('(msatosh------i', msatoshi);
    const route = await lnClient.getRoute(nodeId, msatoshi);
    dispatch({
      type: types.LN_WALLET_GET_ROUTE + FULFILLED,
      payload: route,
    });
    return route;
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_GET_ROUTE + REJECTED,
      payload: {error: err},
    });
  }
};

const payBolt = (bolt11, route) => async dispatch => {
  dispatch({type: types.LN_WALLET_PAY_BOLT + PENDING});
  try {
    await dispatch(initLnClient());
    const route = await lnClient.payBolt11(bolt11, route);
    dispatch({
      type: types.LN_WALLET_PAY_BOLT + FULFILLED,
      payload: route,
    });
    return route;
  } catch (err) {
    error(err);
    dispatch({
      type: types.LN_WALLET_PAY_BOLT + REJECTED,
      payload: {error: err},
    });
  }
};

const getPeers = () => async dispatch => {
  dispatch({type: types.LN_WALLET_PAY_BOLT + PENDING});
  try {
    await dispatch(initLnClient());
    const peers = await lnClient.listPeers();
    return peers;
  } catch (err) {
    error(err);
  }
};

export {
  getFunds,
  getLnNodeInfo,
  getLnWalletDetails,
  decodeBolt,
  getRoute,
  payBolt,
  getPeers,
};