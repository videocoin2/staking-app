import React, { useEffect, useState } from 'react';
import 'typeface-rubik';
import { observer } from 'mobx-react-lite';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import './styles/index.scss';
import Layout from 'components/Layout';
import store from 'store';
import GettingStarted from 'components/GettingStarted';
import App from 'components/App';
import WalletSetup from 'components/WalletSetup';
import { useEagerConnect, useInactiveListener } from './lib/hooks';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from './lib/connectors';
import SwitchNetwork from './components/SwitchNetwork';

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
    return <App />;
  };
  return <Layout>{renderBody()}</Layout>;
}

export default observer(Root);
