import React from 'react';
import Modal from '../Modal';
import { ActionBar, Button, Typography } from 'ui-kit';

const TermsPolicyModal = ({
  onClose,
  onAgree,
  isGenesis,
}: {
  onClose: () => void;
  onAgree: () => void;
  isGenesis: boolean;
}) => {
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="body">
          Terms and Conditions & Privacy Policy
        </Typography>
        <Typography type="smallBody">
          To use our Genesis Staking Program, you must read and agree to both
          our{' '}
          <a
            href="https://storage.googleapis.com/videocoin-network-policies/VideoCoinNetworkTermsofService.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            VideoCoin Network Terms of Service
          </a>{' '}
          and{' '}
          <a
            href={
              isGenesis
                ? 'https://storage.googleapis.com/videocoin-network-policies/VideoCoinNetworkGenesisPoolTermsofServ.html'
                : 'https://storage.googleapis.com/videocoin-network-policies/VideoCoinNetworkDelegatorTermsofService.html'
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {isGenesis
              ? 'Genesis Pool Terms of Service'
              : 'VideoCoin Network Delegator Terms of Service'}
          </a>
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
