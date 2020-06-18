import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from 'kit';
import { formatUnits } from '@ethersproject/units';
import useToggle from 'hooks/useToggle';
import fetchGasPrices from 'api/fetchGasPrice';
import css from './styles.module.scss';
import GasFeeModal from './GasFeeModal';

const GasFee = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) => {
  const { isOpen, hide, show } = useToggle();
  const [gasPrices, setGasPrices] = useState<Record<string, number>>();
  const updateGasPrices = useCallback(async () => {
    const prices = await fetchGasPrices();
    setGasPrices(prices);
    onChange(prices.medium);
  }, [onChange]);
  useEffect((): any => {
    updateGasPrices();
  }, [updateGasPrices]);
  return (
    <div className={css.gasFee}>
      <div>
        <Typography opacity="drift" type="body">
          Transaction Fee
        </Typography>
        <div>
          <Typography tagName="span" type="smallBody">
            {value}
          </Typography>{' '}
          <Typography tagName="span" type="smallBodyThin">
            GWEI
          </Typography>
        </div>
      </div>
      <div>
        <button type="button" onClick={show}>
          <Typography theme="sunkissed" type="button">
            Change
          </Typography>
        </button>
        <div>
          <Typography tagName="span" type="smallBody">
            {formatUnits(value, 'gwei')}
          </Typography>{' '}
          <Typography tagName="span" type="smallBodyThin">
            ETH
          </Typography>
        </div>
      </div>

      {isOpen && (
        <GasFeeModal onClose={hide} onChange={onChange} initialValue={value} />
      )}
    </div>
  );
};

export default GasFee;
