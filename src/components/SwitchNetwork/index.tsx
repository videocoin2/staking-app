import React from 'react';
import { Button, Typography } from 'ui-kit';
import Grid from '../Grid';
import img from './assets/img.jpg';
import img2x from './assets/img@2x.jpg';
import css from './styles.module.scss';

const SwitchNetwork = () => {
  return (
    <div>
      <Typography type="title">Switch Network</Typography>
      <Typography type="subtitleThin">
        Switch MetaMask to use the Main Ethereum Network
      </Typography>
      <div className={css.img}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <Grid>
        <div className={css.installExtension}>
          <Typography align="center" type="subtitleThin">
            Open the MetaMask extension and click the drop-down arrow
            <br /> shown above to switch to the Main Ethereum Network.
          </Typography>
        </div>
      </Grid>
    </div>
  );
};

export default SwitchNetwork;
