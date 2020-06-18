import React from 'react';
import Modal from '../Modal';
import { Typography } from 'kit';

const AwaitingModal = () => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          Awaiting Confirmation
        </Typography>
        <Typography type="subtitleThin">
          Use MetaMask to confirm transactions
        </Typography>
      </div>
    </Modal>
  );
};

export default AwaitingModal;
