import React from 'react';
import { ReactComponent as Logo } from '../assets/logo.svg';
import css from './styles.module.scss';
import Wallet from './Wallet';

const Sidebar = () => {
  return (
    <div className={css.sidebar}>
      <div className={css.logo}>
        <Logo />
      </div>
      <Wallet />
    </div>
  );
};

export default Sidebar;
