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
import { find, merge } from 'lodash/fp';
import { observer } from 'mobx-react-lite';
import publicIp from 'public-ip';
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
import { GENESIS_POOL_WORKERS, TRANSACTION_KEY } from '../../const';
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

const REACT_APP_TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS;
const REACT_APP_ESCROW_ADDRESS = process.env.REACT_APP_ESCROW_ADDRESS;
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
  const [personalStake, setPersonalStake] = useState(0);
  const [accountTOC, setAccountTOC] = useState();
  const closeModal = () => setModal(null);
  const {
    selectedWorker,
    selectWorker,
    vidBalance,
    fetchDelegations,
    db,
  } = store;
  const { account, library } = useWeb3React();
  // eslint-disable-next-line
  const { name, address, worker_state } = selectedWorker;
  const signer = library.getSigner(account);
  const token = contract(REACT_APP_TOKEN_ADDRESS, tokenInterface.abi, signer);

  const escrow = contract(
    REACT_APP_ESCROW_ADDRESS,
    escrowInterface.abi,
    signer
  );
  const isGenesis = GENESIS_POOL_WORKERS.includes(address);

  const handleBack = () => selectWorker(null);
  const handleStakeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // eslint-disable-next-line
    if (worker_state !== 'BONDED') {
      setStake(StakeType.Unstake);
    } else {
      setStake((+value as unknown) as StakeType);
    }
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

  useEffect(() => {
    // eslint-disable-next-line
    if (worker_state && worker_state !== 'BONDED') {
      setStake(StakeType.Unstake);
    }
    // eslint-disable-next-line
  }, [worker_state]);

  useEffect(() => {
    if (db && account) {
      const accountRef = db.collection('accounts').doc(account);
      accountRef.get().then((doc: any) => {
        setAccountTOC(doc.data());
      });
    }
  }, [db, account]);

  useEffect(() => {
    if (escrow && account && selectedWorker) {
      escrow.locked(account, selectedWorker.address).then((value: any) => {
        setPersonalStake(value);
      });
    }
  }, [escrow, account, selectedWorker]);

  const prepareStake = () => {
    updateDB();
    setModal(Modal.confirm);
  };

  const prepareUnstake = () => {
    updateDB();
    handleUnstake();
  };

  const updateDB = async () => {
    if (db) {
      const ipv4 = await publicIp.v4();
      const time = new Date();
      const data = { ip: ipv4, time: time.toString() };
      const obj = isGenesis ? { genesis: data } : { notGenesis: data };
      await db.collection('accounts').doc(account).set(merge(accountTOC, obj));
    }
  };

  const updateCurrentStake = () => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const res = await fetchDelegations();
        const delegate = find({ delegatee: address }, res.data.delegations);
        if (delegate) {
          selectWorker({ ...selectedWorker, personalStake: delegate.amount });
        }
        resolve();
      }, 5000);
    });
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
        .then(async (receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          await updateCurrentStake();
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
      updateCurrentStake();
      let allowancePromise;
      if (diff.lt(0)) {
        allowancePromise = token.increaseApproval(
          REACT_APP_ESCROW_ADDRESS,
          diff.mul(-1),
          overrides
        );
      } else if (diff.gt(0)) {
        allowancePromise = token.decreaseApproval(
          REACT_APP_ESCROW_ADDRESS,
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
          setModal(Modal.awaiting);
          return escrow.transfer(address, parseToken(amount), overrides);
        })
        .then((transaction: TransactionResponse) => {
          setModal(Modal.staking);
          localStorage.setItem(TRANSACTION_KEY, transaction.hash);
          return library.waitForTransaction(transaction.hash, CONFIRMATIONS);
        })
        .then(async (receipt: TransactionReceipt) => {
          if (receipt.status === 0) {
            throw new Error(`Transaction ${receipt.transactionHash} failed`);
          }
          await updateCurrentStake();
          localStorage.removeItem(TRANSACTION_KEY);
          setModal(Modal.successStaking);
        })
        .catch(() => {
          setModal(Modal.error);
          localStorage.removeItem(TRANSACTION_KEY);
        });
    },
    [address, amount, escrow, library, token]
  );

  const handleStake = useCallback(async () => {
    const overrides = {
      gasLimit: GAS_LIMIT,
      gasPrice: gasFee * 1e9,
    };
    setModal(Modal.awaiting);
    const allowed = await token.allowance(account, REACT_APP_ESCROW_ADDRESS);
    const diff = allowed.sub(parseToken(amount));
    if (diff.eq(0)) {
      justTransfer(overrides);
    } else {
      allowanceAndTransfer(diff, overrides);
    }
  }, [account, allowanceAndTransfer, amount, gasFee, justTransfer, token]);
  const handleUnstake = useCallback(async () => {
    setModal(Modal.awaiting);
    const overrides = {
      gasLimit: GAS_LIMIT,
      gasPrice: gasFee * 1e9,
    };
    const locked = await escrow.locked(account, selectedWorker.address);
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
      .then(async (receipt: TransactionReceipt) => {
        if (receipt.status === 0) {
          setModal(Modal.error);
          throw new Error(`Transaction ${receipt.transactionHash} failed`);
        }
        await updateCurrentStake();
        setModal(Modal.successUnstaking);
      })
      .catch(() => {
        setModal(Modal.error);
      });
  }, [account, amount, escrow, gasFee, library, selectedWorker.address]);
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
        <TermsPolicyModal
          onClose={closeModal}
          onAgree={prepareStake}
          isGenesis={isGenesis}
        />
      ),
      [Modal.agreementUnstake]: (
        <TermsPolicyModal
          onClose={closeModal}
          onAgree={prepareUnstake}
          isGenesis={isGenesis}
        />
      ),
    }),
    [handleStake, isGenesis]
  );
  const isUnstake = stake === StakeType.Unstake;
  const requireStake = () => {
    if (
      !accountTOC ||
      (isGenesis && !(accountTOC as any).genesis) ||
      (!isGenesis && !(accountTOC as any).notGenesis)
    ) {
      setModal(isUnstake ? Modal.agreementUnstake : Modal.agreementStake);
    } else if (isUnstake) {
      prepareUnstake();
    } else {
      setModal(Modal.confirm);
    }
  };
  if (!selectedWorker) return null;

  const formattedPersonalStake = formatToken(personalStake);
  const formattedTotalValue = formatToken(
    isUnstake ? personalStake : vidBalance
  );
  const disabled =
    !amount || parseFloat(amount) <= 0 || +amount > +formattedTotalValue;
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
        <Button disabled={disabled} onClick={requireStake}>
          {isUnstake ? 'Unstake' : 'Stake'} Tokens
        </Button>
      </div>
      {modal !== null ? modals[modal] : null}
    </div>
  );
};

export default observer(WorkerPage);
