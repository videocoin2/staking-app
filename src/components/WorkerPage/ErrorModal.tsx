import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'kit';

const ErrorModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          Error
        </Typography>
        <div style={{ marginTop: 56 }}>
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Close
            </Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
