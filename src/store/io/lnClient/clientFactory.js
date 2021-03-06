import {lnClient} from 'sifir-js-sdk';
let _lnClient = null;
export default async ({transport}) => {
  if (!_lnClient) {
    _lnClient = lnClient({
      transport,
    });
  }
  return _lnClient;
};
