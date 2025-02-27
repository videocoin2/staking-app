import { formatEther } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import contract from 'lib/contract';
import { formatToken } from 'lib/units';
import { toFixedNoRound } from 'lib/utils';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect } from 'react';
import store from 'store';
import { Typography } from 'ui-kit';
import { BALANCE_FETCH_INTERVAL } from '../../const';
import useInterval from '../../hooks/useInterval';
import logo from './assets/logo.png';
import logo2x from './assets/logo@2x.png';
import css from './styles.module.scss';
const REACT_APP_TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS;

const Wallet = () => {
  const {
    isMetamaskInstalled,
    setVidBalance,
    setEthBalance,
    ethBalance,
    vidBalance,
    setToken,
    setAccount,
    fetchDelegations,
    token,
    totalStake,
  } = store;
  const { account, library, chainId } = useWeb3React();
  const getTokenBalance = useCallback(async () => {
    try {
      const newBalance = await token.balanceOf(account);
      setVidBalance(newBalance);
    } catch (e) {
      setVidBalance(0);
    }
  }, [account, setVidBalance, token]);
  const getEthBalance = useCallback(async () => {
    try {
      const newBalance = await library.getBalance(account);
      setEthBalance(newBalance);
    } catch (e) {
      setEthBalance(0);
    }
  }, [account, library, setEthBalance]);
  const getBalance = useCallback(async () => {
    if (!account || !library || !token || !chainId) return;
    getTokenBalance();
    getEthBalance();
    fetchDelegations();
  }, [
    account,
    chainId,
    getEthBalance,
    getTokenBalance,
    fetchDelegations,
    library,
    token,
  ]);
  useEffect(() => {
    if (!account || !library || !chainId) return;
    const abi = require('contract/token.json').abi;
    const vid = contract(REACT_APP_TOKEN_ADDRESS, abi, library);
    setToken(vid);
    setAccount(account);
  }, [account, chainId, library, setAccount, setToken]);
  useEffect(() => {
    getBalance();
  }, [getBalance]);
  useInterval(getBalance, BALANCE_FETCH_INTERVAL);

  const formattedEthBalance = toFixedNoRound(formatEther(ethBalance), 2);
  // VID token has same precision as ETH coin, so we can use ether format utils
  const formattedVidBalance = toFixedNoRound(formatToken(vidBalance), 2);
  const formattedTotalStake = toFixedNoRound(
    totalStake ? formatToken(totalStake) : '0',
    2
  );
  const renderMetaMaskData = () => {
    if (!isMetamaskInstalled) {
      return (
        <Typography type="smallBodyThin" theme="sunkissed">
          Not installed
        </Typography>
      );
    }
    if (!chainId) {
      return (
        <Typography type="smallBodyThin" theme="sunkissed">
          Switch to Main Network
        </Typography>
      );
    }
    if (account) {
      return <Typography type="smallBodyThin">{account}</Typography>;
    }
    return (
      <Typography type="smallBodyThin" theme="sunkissed">
        No Wallet Setup
      </Typography>
    );
  };
  return (
    <>
      <div className={css.root}>
        <Typography type="subtitleCaps">videocoin wallet</Typography>
        <div className={css.card}>
          <div className={css.walletTop}>
            <img src={logo} srcSet={`${logo2x} 2x`} alt="" />
            <div className={css.address}>
              <Typography type="body">MetaMask</Typography>
              {renderMetaMaskData()}
            </div>
          </div>
          {account && (
            <>
              <div className={css.balanceRow}>
                <Typography type="body">VID Balance</Typography>
                <Typography theme="white" type="body">
                  {formattedVidBalance}
                </Typography>
                <Typography type="smallBodyThin">VID</Typography>
              </div>
              <div className={css.balanceRow}>
                <Typography type="body">ETH Balance</Typography>
                <Typography theme="white" type="body">
                  {formattedEthBalance}
                </Typography>
                <Typography type="smallBodyThin">ETH</Typography>
              </div>
            </>
          )}
        </div>
        {!isMetamaskInstalled && (
          <Typography type="tiny" align="center">
            *install MetaMask browser extension to continue
          </Typography>
        )}
        {account && (
          <Typography type="tiny" align="center">
            *use browser extension to change wallet
          </Typography>
        )}
      </div>
      {account && (
        <div className={css.root}>
          <div className={css.totalStake}>
            <Typography type="subtitleCaps">Staking</Typography>
            <div className={css.balanceRow}>
              <Typography type="body">Total Staked</Typography>
              <Typography theme="white" type="body">
                {formattedTotalStake}
              </Typography>
              <Typography type="smallBodyThin">VID</Typography>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default observer(Wallet);
