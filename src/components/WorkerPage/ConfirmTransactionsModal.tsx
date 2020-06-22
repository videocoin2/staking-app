import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'ui-kit';

const ConfirmTransactionsModal = ({
  onClose,
  onNext,
}: {
  onClose: () => void;
  onNext: () => void;
}) => {
  return (
    <Modal onClose={onClose}>
      <div className="modalInner">
        <Typography type="body">
          You’ll Need to Confirm 2 Transactions
        </Typography>
        <Typography>
          MetaMask will give you 2 transactions to confirm. Both together add up
          to the VID amount entered and ETH gas fee.
        </Typography>
        <div style={{ marginTop: 56 }}>
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onNext}>Next</Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmTransactionsModal;
