import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import App from 'components/App';
import GettingStarted from 'components/GettingStarted';
import Layout from 'components/Layout';
import WalletError from 'components/WalletError';
import WalletSetup from 'components/WalletSetup';
import { filter } from 'lodash/fp';
import { observer } from 'mobx-react-lite';
import { default as React, useEffect, useMemo, useState } from 'react';
import store from 'store';
import 'typeface-rubik';
import fetchWorkers from './api/fetchWorkers';
import SwitchNetwork from './components/SwitchNetwork';
import { injected } from './lib/connectors';
import { useEagerConnect, useInactiveListener } from './lib/hooks';
import './styles/index.scss';

const connectorsByName: { [name: string]: AbstractConnector } = {
  Injected: injected,
};

const name = 'Injected';
const currentConnector = connectorsByName[name];

function Root() {
  const { isMetamaskInstalled } = store;
  const { connector, activate, account, chainId } = useWeb3React<
    Web3Provider
  >();
  const triedEager = useEagerConnect();
  const [activatingConnector, setActivatingConnector] = useState<
    AbstractConnector
  >();
  useInactiveListener(!triedEager || !!activatingConnector);
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);
  useEffect(() => {
    setActivatingConnector(currentConnector);
    activate(connectorsByName[name]);
  }, [activate]);
  useMemo(async () => {
    if (account) {
      const items = await fetchWorkers();
      const transcoderMatch = filter(
        // eslint-disable-next-line
        ({ is_internal, address }) =>
          // eslint-disable-next-line
          !is_internal && address === account
      )(items);
      setKeyUsedByTranscoder(transcoderMatch.length !== 0);
    }
  }, [account]);
  const [keyUsedByTranscoder, setKeyUsedByTranscoder] = useState(false);

  const renderBody = () => {
    if (!isMetamaskInstalled) {
      return <GettingStarted />;
    }
    if (!chainId) {
      return <SwitchNetwork />;
    }
    if (!account) {
      return <WalletSetup />;
    }
    if (keyUsedByTranscoder) {
      return <WalletError />;
    }
    return <App />;
  };
  return <Layout>{renderBody()}</Layout>;
}

export default observer(Root);
