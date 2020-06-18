import React from 'react';
import 'rc-input-number/assets/index.css';
import InputNumber from 'rc-input-number';
import { ReactComponent as ArrowDown } from 'assets/arrowDown.svg';
import { ReactComponent as ArrowUp } from 'assets/arrowUp.svg';
import './styles.scss';

const upHandler = (
  <div>
    <ArrowUp />
  </div>
);
const downHandler = (
  <div>
    <ArrowDown />
  </div>
);

const NumberSpinner = (props: any) => (
  <div className="custom__number-spinner">
    <InputNumber upHandler={upHandler} downHandler={downHandler} {...props} />
  </div>
);

export default NumberSpinner;
