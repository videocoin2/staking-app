import { InjectedConnector } from '@web3-react/injected-connector';
import { map } from 'lodash/fp';

const REACT_APP_NETWORKS = map<string, number>(parseInt)(
  process.env.REACT_APP_NETWORKS.split(',')
);

export const injected = new InjectedConnector({
  supportedChainIds: REACT_APP_NETWORKS,
});
