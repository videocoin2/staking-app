import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Typography, Button } from 'kit';
import { BigNumber } from '@ethersproject/bignumber';
import { observer } from 'mobx-react-lite';
import store from 'store';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import css from './styles.module.scss';
import { ReactComponent as ArrowLeft } from 'assets/arrowLeft.svg';
import StakeToggle, { StakeType } from './StakeToggle';
import GasFee from './GasFee';
import AmountInput from './AmountInput';
import contract from 'lib/contract';
import { useWeb3React } from '@web3-react/core';
import tokenInterface from 'contract/token.abi.json';
import escrowInterface from 'contract/escrow.abi.json';
import ConfirmTransactionsModal from './ConfirmTransactionsModal';
import AwaitingModal from './AwaitingModal';
import ErrorModal from './ErrorModal';
import StakingModal from './StakingModal';
import SuccessModal from './SuccessModal';
import { TRANSACTION_KEY } from '../../const';

const GAS_LIMIT = 800000;

enum Modal {
  confirm,
  awaiting,
  staking,
  unstaking,
  error,
  success,
}

const WorkerPage = () => {
  const [stake, setStake] = useState(StakeType.Stake);
  const [amount, setAmount] = useState('');
  const [gasFee, setGasFee] = useState(1);
  const [modal, setModal] = useState<Modal | null>(null);
  const closeModal = () => setModal(null);
  const { selectedWorker, selectWorker } = store;
  const { account, library, chainId } = useWeb3React();
  const { name, address, personalStake = 0 } = selectedWorker;
  const signer = library.getSigner(account);
  const tokenAddress = chainId
    ? require('contract/token.addr.json')[chainId]?.address
    : '0x0';
  const token = contract(tokenAddress, tokenInterface, signer);

  const escrowAddress = chainId
    ? require('contract/escrow.addr.json')[chainId].address
    : '0x0';
  const escrow = contract(escrowAddress, escrowInterface, signer);

  const handleBack = () => selectWorker(null);
  const handleStakeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStake((+value as unknown) as StakeType);
  };

  const justTransfer = useCallback(
    (overrides: any) => {
      escrow
        .transfer(address, amount, overrides)
        .then((transaction: TransactionResponse) => {
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash);
        })
        .then((receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);
        })
        .catch(() => {
          localStorage.removeItem(TRANSACTION_KEY);
        });
    },
    [address, amount, escrow, library]
  );

  const allowanceAndTransfer = useCallback(
    (diff: BigNumber, overrides: any) => {
      let allowancePromise;
      if (diff.lt(0)) {
        allowancePromise = token.increaseAllowance(
          escrowAddress,
          diff.mul(-1),
          overrides
        );
      } else if (diff.gt(0)) {
        allowancePromise = token.decreaseAllowance(
          escrowAddress,
          diff,
          overrides
        );
      }
      allowancePromise
        .then((transaction: TransactionResponse) => {
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash);
        })
        .then(async (receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);

          return escrow.transfer(address, amount, overrides);
        })
        .then((transaction: TransactionResponse) => {
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash);
        })
        .then((receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);
        })
        .catch(() => {
          localStorage.removeItem(TRANSACTION_KEY);
        });
    },
    [address, amount, escrow, escrowAddress, library, token]
  );

  const handleStake = useCallback(async () => {
    const overrides = {
      gasPrice: gasFee * 1e9,
    };
    const allowed = await token.allowance(account, escrowAddress);
    const diff = allowed.sub(amount);
    if (diff.eq(0)) {
      justTransfer(overrides);
    } else {
      allowanceAndTransfer(diff, overrides);
    }
  }, [
    account,
    allowanceAndTransfer,
    amount,
    escrowAddress,
    gasFee,
    justTransfer,
    token,
  ]);
  const modals: Record<Modal, ReactNode> = useMemo(
    () => ({
      [Modal.confirm]: (
        <ConfirmTransactionsModal onClose={closeModal} onNext={handleStake} />
      ),
      [Modal.awaiting]: <AwaitingModal />,
      [Modal.staking]: <StakingModal />,
      [Modal.unstaking]: <StakingModal unstake />,
      [Modal.error]: <ErrorModal onClose={closeModal} />,
      [Modal.success]: <SuccessModal />,
    }),
    [handleStake]
  );
  const handleUnstake = () => {
    setModal(Modal.awaiting);
    const overrides = {
      gasLimit: GAS_LIMIT,
      gasPrice: gasFee * 1e9,
    };
    escrow
      .transferFrom(selectedWorker.address, account, amount, overrides)
      .then((transaction: TransactionResponse) => {
        setModal(Modal.unstaking);
        return library.waitForTransaction(transaction.hash);
      })
      .then((receipt: TransactionReceipt) => {
        if (receipt.status === 0) {
          setModal(Modal.error);
          throw new Error(`Transaction ${receipt.transactionHash} failed`);
        }
        closeModal();
      })
      .catch(() => {
        setModal(Modal.error);
      });
  };
  const isUnstake = stake === StakeType.Unstake;
  if (!selectedWorker) return null;
  return (
    <div className={css.root}>
      <button type="button" className={css.backBtn} onClick={handleBack}>
        <ArrowLeft />
      </button>
      <Typography type="title">{name}</Typography>
      <Typography type="bodyThin">{address}</Typography>
      <div className={css.currentStake}>
        <Typography type="subtitle">Current Stake</Typography>
        <Typography type="subtitle" theme="white">
          {personalStake}
        </Typography>
        <Typography type="bodyThin">VID</Typography>
      </div>
      <Typography className={css.head} type="subtitleCaps">
        worker staking
      </Typography>

      <StakeToggle value={stake} onChange={handleStakeChange} />

      <AmountInput value={amount} onChange={setAmount} />
      <GasFee value={gasFee} onChange={setGasFee} />
      <div className={css.submitBtn}>
        <Button
          disabled={!amount}
          onClick={isUnstake ? handleUnstake : handleStake}
        >
          {isUnstake ? 'Unstake' : 'Stake'} Tokens
        </Button>
      </div>
      {modal && modals[modal]}
    </div>
  );
};

export default observer(WorkerPage);
