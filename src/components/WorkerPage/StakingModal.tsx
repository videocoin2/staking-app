import React from 'react';
import Modal from '../Modal';
import { Typography } from 'ui-kit';

const StakingModal = ({ unstake = false }: { unstake?: boolean }) => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          {unstake ? 'Unstaking' : 'Staking'} Tokens...
        </Typography>
        <Typography type="subtitleThin">
          Transactions are being sent through MetaMask
        </Typography>
      </div>
    </Modal>
  );
};

export default StakingModal;
