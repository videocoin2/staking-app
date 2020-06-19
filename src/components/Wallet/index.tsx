import { formatEther } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { Typography } from 'kit';
import contract from 'lib/contract';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect } from 'react';
import store from 'store';
import logo from './assets/logo.png';
import logo2x from './assets/logo@2x.png';
import css from './styles.module.scss';

const Wallet = () => {
  const {
    isMetamaskInstalled,
    setVidBalance,
    setEthBalance,
    ethBalance,
    vidBalance,
    setToken,
    setAccount,
    token,
    totalStake,
  } = store;
  const { account, library, chainId } = useWeb3React();

  useEffect(() => {
    if (!account || !library || !chainId) return;

    const abi = require('contract/token.abi.json');
    const address = require('contract/token.addr.json')[chainId]?.address;
    const vid = contract(address, abi, library);
    setToken(vid);
    setAccount(account);
  }, [account, chainId, library, setAccount, setToken]);
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
    if (!account || !library || !token || !chainId) {
      return;
    }
    getTokenBalance();
    getEthBalance();
  }, [account, chainId, getEthBalance, getTokenBalance, library, token]);
  useEffect(() => {
    getBalance();
  }, [getBalance]);

  const formattedEthBalance = parseFloat(formatEther(ethBalance)).toPrecision(
    5
  );
  // VID token has same precision as ETH coin, so we can use ether format utils
  const formattedVidBalance = parseFloat(formatEther(vidBalance)).toPrecision(
    5
  );
  const formattedTotalStake = parseFloat(
    totalStake ? formatEther(totalStake) : '0'
  ).toPrecision(5);

  return (
    <>
      <div className={css.root}>
        <Typography type="subtitleCaps">videocoin wallet</Typography>
        <div className={css.card}>
          <div className={css.walletTop}>
            <img src={logo} srcSet={`${logo2x} 2x`} alt="" />
            <div className={css.address}>
              <Typography type="body">MetaMask</Typography>
              {!isMetamaskInstalled && (
                <Typography type="smallBodyThin" theme="sunkissed">
                  Not installed
                </Typography>
              )}
              {account ? (
                <Typography type="smallBodyThin">{account}</Typography>
              ) : (
                <Typography type="smallBodyThin" theme="sunkissed">
                  No Wallet Setup
                </Typography>
              )}
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
