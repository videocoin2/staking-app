import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import css from './styles.module.scss';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={css.layout}>
      <Sidebar />
      <div className={css.content}>{children}</div>
    </div>
  );
};

export default Layout;
