import React from 'react';
import Modal from '../Modal';
import { Typography } from 'kit';

const SuccessModal = ({ unstake = false }: { unstake?: boolean }) => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          {unstake ? 'Unstaking' : 'Staking'} Was Successful
        </Typography>
        <Typography type="subtitleThin">
          You'll now see your total stake updated to reflect these newly staked
          tokens.
        </Typography>
      </div>
    </Modal>
  );
};

export default SuccessModal;
