import React, { useState } from 'react';
import { ActionBar, Button, Typography } from 'ui-kit';
import NumberSpinner from '../NumberSpinner';
import Modal from '../Modal';
import css from './styles.module.scss';

const GasFeeModal = ({
  onClose,
  onChange,
  initialValue,
}: {
  initialValue: number;
  onClose: () => void;
  onChange: (val: number) => void;
}) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = () => {
    onChange(value);
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div className="modalInner">
        <div className={css.gasModalInner}>
          <div className={css.gasFeeValue}>
            <NumberSpinner min={1} step={1} value={value} onChange={setValue} />
            <Typography type="smallTitle" theme="white">
              GWEI
            </Typography>
          </div>
          <Typography type="body">Select amount of GAS to use</Typography>
          <Typography type="smallBodyThin">
            Unsure how much to use? We recommend using the default set amount.
            The more GAS used, the faster your transactions will be processed.
          </Typography>
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleChange}>Okay</Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default GasFeeModal;
