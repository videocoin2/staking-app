import React from 'react';
import { Typography } from 'kit';
import css from './styles.module.scss';
import img from './assets/img.jpg';
import img2x from './assets/img@2x.jpg';
import Grid from '../Grid';

const WalletSetup = () => {
  return (
    <div>
      <Typography type="title">Finish MetaMask Setup</Typography>
      <Typography type="subtitleThin">
        Setup the MetaMask browser extension to start staking
      </Typography>
      <div className={css.img}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <Grid>
        <div className={css.installExtension}>
          <Typography>Finish Setting Up MetaMask</Typography>
        </div>
        <a
          href="https://tokenmarket.net/what-is/how-to-install-and-setup-metamask/"
          target="_blank"
          rel="noopener noreferrer"
          className={css.docLink}
        >
          <Typography align="center" type="subtitle">
            Setup New MetaMask Wallet
          </Typography>
        </a>
        <a
          href="https://tokenmarket.net/what-is/how-to-connect-ledger-and-metamask/"
          target="_blank"
          rel="noopener noreferrer"
          className={css.docLink}
        >
          <Typography align="center" type="subtitle">
            Setup Ledger through MetaMask
          </Typography>
        </a>
        <a
          href="https://metamask.zendesk.com/hc/en-us/articles/360020394612-How-to-connect-a-Trezor-or-Ledger-Hardware-Wallet"
          target="_blank"
          rel="noopener noreferrer"
          className={css.docLink}
        >
          <Typography align="center" type="subtitle">
            Setup Trezor through MetaMask
          </Typography>
        </a>
      </Grid>
    </div>
  );
};

export default WalletSetup;
