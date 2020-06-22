import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'ui-kit';

const TermsPolicyModal = ({
  onClose,
  onAgree,
}: {
  onClose: () => void;
  onAgree: () => void;
}) => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="body">
          Terms and Conditions & Privacy Policy
        </Typography>
        <Typography type="smallBody">
          To use our Genesis Staking Program, you must read and agree to both
          our <a href="#">Terms and Conditions</a> and{' '}
          <a href="">Privacy Policy</a>
        </Typography>
        <div style={{ marginTop: 56 }}>
          <ActionBar>
            <Button theme="minimal" onClick={onClose}>
              Disagree
            </Button>
            <Button onClick={onAgree}>Agree</Button>
          </ActionBar>
        </div>
      </div>
    </Modal>
  );
};

export default TermsPolicyModal;
