import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import { Typography } from 'ui-kit';
import Modal from '../Modal';

const StakingModal = ({
  unstake = false,
  waitBlock = 1,
}: {
  unstake?: boolean;
  waitBlock?: number;
}) => {
  const { library } = useWeb3React();
  const [blockNumber, setBlockNumber] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  useEffect(() => {
    library.on('block', (currentBlockNumber: number) => {
      if (blockNumber !== currentBlockNumber) {
        setBlockNumber(blockNumber);
        setConfirmations(confirmations + 1);
      }
    });
  }, [library, confirmations, blockNumber]);
  useEffect(() => {
    return () => {
      library.off('block');
    };
  }, []);
  return (
    <Modal onClose={() => false}>
      <div className="modalInner">
        <Typography type="title" theme="white">
          {unstake ? 'Unstaking' : 'Staking'} Tokens...
        </Typography>
        <Typography type="subtitleThin">
          Transactions are being sent through MetaMask
        </Typography>
        <Typography type="smallBodyThin">
          {confirmations}/{waitBlock} blocks to confirm transaction
        </Typography>
      </div>
    </Modal>
  );
};

export default StakingModal;
