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
  const [blockConfirmations, setBlockConfirmations] = useState(0);
  useEffect(() => {
    library.on('block', () => {
      setBlockConfirmations(blockConfirmations + 1);
    });
  }, [library, blockConfirmations]);
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
          Blocks to confirm transaction {blockConfirmations}/{waitBlock}
        </Typography>
      </div>
    </Modal>
  );
};

export default StakingModal;
