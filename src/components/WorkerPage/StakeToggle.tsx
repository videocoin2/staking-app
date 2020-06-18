import React, { ChangeEvent } from 'react';
import css from './styles.module.scss';
import cn from 'classnames';

export enum StakeType {
  Stake,
  Unstake,
}

const StakeToggle = ({
  value,
  onChange,
}: {
  value: StakeType;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const isUnstake = value === StakeType.Unstake;
  return (
    <div className={css.stakeToggle}>
      <label className={cn({ [css.active]: !isUnstake })}>
        <span className={css.stakeToggleLabel}>Stake</span>
        <input
          type="radio"
          checked={!isUnstake}
          value={StakeType.Stake}
          name="stake"
          onChange={onChange}
        />
      </label>
      <label className={cn({ [css.active]: isUnstake })}>
        <span className={css.stakeToggleLabel}>Unstake</span>
        <input
          type="radio"
          checked={isUnstake}
          value={StakeType.Unstake}
          name="stake"
          onChange={onChange}
        />
      </label>
      <div
        className={cn(css.stakeToggleHandle, {
          [css.right]: isUnstake,
        })}
      />
    </div>
  );
};

export default StakeToggle;
