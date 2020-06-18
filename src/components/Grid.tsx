import React, { ReactNode } from 'react';
import css from './styles.module.scss';

const Grid = ({ children }: { children: ReactNode }) => {
  return <div className={css.grid}>{children}</div>;
};

export default Grid;
