import React from 'react';
import { Typography, Button } from 'ui-kit';
import img from './assets/download-extension.png';
import img2x from './assets/download-extension@2x.png';
import browsers from './assets/browsers.png';
import browsers2x from './assets/browsers@2x.png';
import Grid from '../Grid';
import css from './styles.module.scss';
import useToggle from '../../hooks/useToggle';
import AfterInstallWarn from './AfterInstallWarn';

const GettingStarted = () => {
  const { isOpen, show, hide } = useToggle();

  return (
    <div>
      <Typography type="title">Install MetaMask</Typography>
      <Typography type="subtitleThin">
        Get the MetaMask browser extension to start staking
      </Typography>
      <div className={css.img}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <Grid>
        <div className={css.installExtension}>
          <a
            onClick={show}
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Install Metamask Extension</Button>
          </a>
          <div className={css.browsersImg}>
            <img src={browsers} srcSet={`${browsers2x} 2x`} alt="" />
          </div>
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
      {isOpen && <AfterInstallWarn onClose={hide} />}
    </div>
  );
};

export default GettingStarted;
