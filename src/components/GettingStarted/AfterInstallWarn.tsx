import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'ui-kit';

const AfterInstallWarn = ({ onClose }: { onClose: () => void }) => {
  const onReload = () => window.location.reload();
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          Refresh Page To Detect MetMask Installation
        </Typography>
        <Typography type="subtitleThin">
          In order to continue, please refresh this tab once MetaMask is
          installed.
        </Typography>
        <div className="mt32">
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onReload}>Reload</Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default AfterInstallWarn;
