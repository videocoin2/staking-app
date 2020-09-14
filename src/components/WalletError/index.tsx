import React from 'react';
import { Typography } from 'ui-kit';
import img from './assets/activeWorker.png';
import img2x from './assets/activeWorker@2x.png';
import css from './styles.module.scss';

const WalletError = () => {
  return (
    <div className={css.root}>
      <Typography type="display4" weight="normal">
        Cannot Use Selected Wallet
      </Typography>
      <Typography opacity="drift" type="subtitleThin">
        Your selected address is already being used with a VideoCoin Network
        worker
      </Typography>
      <img
        className={css.img}
        src={img}
        width={329}
        srcSet={`${img2x} 2x`}
        alt=""
      />
      <div className={css.box}>
        <Typography type="subtitleThin">
          Choose a different wallet address that hasn’t already been <br />
          used to setup a VideoCoin Network worker.
        </Typography>
      </div>
    </div>
  );
};

export default WalletError;
