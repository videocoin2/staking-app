import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'kit';

const SuccessModal = ({
  unstake = false,
  onClose,
}: {
  unstake?: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal onClose={onClose}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          {unstake ? 'Unstaking' : 'Staking'} Was Successful
        </Typography>
        <Typography type="subtitleThin">
          You'll now see your total stake updated to reflect these newly staked
          tokens.
        </Typography>
        <div style={{ marginTop: 56 }}>
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Okay
            </Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
