import { BigNumber } from '@ethersproject/bignumber';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as ArrowLeft } from 'assets/arrowLeft.svg';
import escrowInterface from 'contract/escrow.json';
import tokenInterface from 'contract/token.json';
import contract from 'lib/contract';
import { formatToken, parseToken } from 'lib/units';
import { observer } from 'mobx-react-lite';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import store from 'store';
import { Button, Typography } from 'ui-kit';
import { TRANSACTION_KEY } from '../../const';
import AmountInput from './AmountInput';
import AwaitingModal from './AwaitingModal';
import ConfirmTransactionsModal from './ConfirmTransactionsModal';
import ErrorModal from './ErrorModal';
import GasFee from './GasFee';
import StakeToggle, { StakeType } from './StakeToggle';
import StakingModal from './StakingModal';
import css from './styles.module.scss';
import SuccessModal from './SuccessModal';
import TermsPolicyModal from './TermsPolicyModal';

const GAS_LIMIT = 800000;
const CONFIRMATIONS = 8;

enum Modal {
  confirm,
  awaiting,
  staking,
  unstaking,
  error,
  successUnstaking,
  successStaking,
  agreementStake,
  agreementUnstake,
}

const WorkerPage = () => {
  const [stake, setStake] = useState(StakeType.Stake);
  const [amount, setAmount] = useState('');
  const [cachedAmount, setCachedAmount] = useState('');
  const [gasFee, setGasFee] = useState(1);
  const [modal, setModal] = useState<Modal | null>(null);
  const closeModal = () => setModal(null);
  const { selectedWorker, selectWorker, vidBalance } = store;
  const { account, library, chainId } = useWeb3React();
  const { name, address, personalStake = 0 } = selectedWorker;
  const signer = library.getSigner(account);
  const tokenAddress = chainId
    ? require('contract/token.json').networks[chainId]?.address
    : '0x0';
  const token = contract(tokenAddress, tokenInterface.abi, signer);

  const escrowAddress = chainId
    ? require('contract/escrow.json').networks[chainId].address
    : '0x0';
  const escrow = contract(escrowAddress, escrowInterface.abi, signer);

  const handleBack = () => selectWorker(null);
  const handleStakeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStake((+value as unknown) as StakeType);
    const temp = amount;
    setAmount(cachedAmount);
    setCachedAmount(temp);
  };
  useEffect(() => {
    if (localStorage.getItem(TRANSACTION_KEY)) {
      library
        .waitForTransaction(
          localStorage.getItem(TRANSACTION_KEY),
          CONFIRMATIONS
        )
        .then((receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);
        })
        .catch(() => {
          localStorage.removeItem(TRANSACTION_KEY);
        });
    }
  }, [library]);

  const prepareStake = () => {
    setModal(Modal.confirm);
  };

  const justTransfer = useCallback(
    (overrides: any) => {
      escrow
        .transfer(address, parseToken(amount), overrides)
        .then((transaction: TransactionResponse) => {
          setModal(Modal.staking);
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash, CONFIRMATIONS);
        })
        .then((receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);
          setModal(Modal.successStaking);
        })
        .catch(() => {
          localStorage.removeItem(TRANSACTION_KEY);
          setModal(Modal.error);
        });
    },
    [address, amount, escrow, library]
  );

  const allowanceAndTransfer = useCallback(
    (diff: BigNumber, overrides: any) => {
      let allowancePromise;
      if (diff.lt(0)) {
        allowancePromise = token.increaseApproval(
          escrowAddress,
          diff.mul(-1),
          overrides
        );
      } else if (diff.gt(0)) {
        allowancePromise = token.increaseApproval(
          escrowAddress,
          diff,
          overrides
        );
      }
      allowancePromise
        .then((transaction: TransactionResponse) => {
          setModal(Modal.staking);
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash, CONFIRMATIONS);
        })
        .then(async (receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);

          return escrow.transfer(address, parseToken(amount), overrides);
        })
        .then((transaction: TransactionResponse) => {
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash, CONFIRMATIONS);
        })
        .then((receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          localStorage.removeItem(TRANSACTION_KEY);
          setModal(Modal.successStaking);
        })
        .catch(() => {
          setModal(Modal.error);
          localStorage.removeItem(TRANSACTION_KEY);
        });
    },
    [address, amount, escrow, escrowAddress, library, token]
  );

  const handleStake = useCallback(async () => {
    const overrides = {
      gasLimit: GAS_LIMIT,
      gasPrice: gasFee * 1e9,
    };
    setModal(Modal.awaiting);
    const allowed = await token.allowance(account, escrowAddress);
    const diff = allowed.sub(parseToken(amount));
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
  const handleUnstake = async () => {
    setModal(Modal.awaiting);
    const overrides = {
      gasLimit: GAS_LIMIT,
      gasPrice: gasFee * 1e9,
    };
    const locked = await escrow.locked(account, selectedWorker.address);
    console.log(locked.toString());
    console.log(parseToken(amount).toString());
    escrow
      .transferFrom(
        selectedWorker.address,
        account,
        parseToken(amount),
        overrides
      )
      .then((transaction: TransactionResponse) => {
        setModal(Modal.unstaking);
        return library.waitForTransaction(transaction.hash, CONFIRMATIONS);
      })
      .then((receipt: TransactionReceipt) => {
        if (receipt.status === 0) {
          setModal(Modal.error);
          throw new Error(`Transaction ${receipt.transactionHash} failed`);
        }
        setModal(Modal.successUnstaking);
      })
      .catch(() => {
        setModal(Modal.error);
      });
  };
  const modals: Record<Modal, ReactNode> = useMemo(
    () => ({
      [Modal.confirm]: (
        <ConfirmTransactionsModal onClose={closeModal} onNext={handleStake} />
      ),
      [Modal.awaiting]: <AwaitingModal />,
      [Modal.staking]: <StakingModal waitBlock={CONFIRMATIONS} />,
      [Modal.unstaking]: <StakingModal unstake waitBlock={CONFIRMATIONS} />,
      [Modal.error]: <ErrorModal onClose={closeModal} />,
      [Modal.successStaking]: <SuccessModal onClose={closeModal} />,
      [Modal.successUnstaking]: <SuccessModal onClose={closeModal} unstake />,
      [Modal.agreementStake]: (
        <TermsPolicyModal onClose={closeModal} onAgree={prepareStake} />
      ),
      [Modal.agreementUnstake]: (
        <TermsPolicyModal onClose={closeModal} onAgree={handleUnstake} />
      ),
    }),
    [handleStake]
  );
  const isUnstake = stake === StakeType.Unstake;
  const requireStake = () =>
    setModal(isUnstake ? Modal.agreementUnstake : Modal.agreementStake);
  if (!selectedWorker) return null;

  const formattedPersonalStake = parseFloat(formatToken(personalStake)).toFixed(
    2
  );
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
          {formattedPersonalStake}
        </Typography>
        <Typography type="bodyThin">VID</Typography>
      </div>
      <Typography className={css.head} type="subtitleCaps">
        worker staking
      </Typography>

      <StakeToggle value={stake} onChange={handleStakeChange} />

      <AmountInput
        value={amount}
        totalValue={isUnstake ? personalStake : vidBalance}
        stake={stake}
        onChange={setAmount}
      />
      <GasFee value={gasFee} onChange={setGasFee} />
      <div className={css.submitBtn}>
        <Button disabled={!amount} onClick={requireStake}>
          {isUnstake ? 'Unstake' : 'Stake'} Tokens
        </Button>
      </div>
      {modal !== null ? modals[modal] : null}
    </div>
  );
};

export default observer(WorkerPage);
