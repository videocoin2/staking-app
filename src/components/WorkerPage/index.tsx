/* eslint-disable @typescript-eslint/camelcase */

import { BigNumber } from '@ethersproject/bignumber';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as ArrowLeft } from 'assets/arrowLeft.svg';
import escrowInterface from 'contract/escrow.json';
import tokenInterface from 'contract/token.json';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import contract from 'lib/contract';
import { formatToken, parseToken } from 'lib/units';
import { find } from 'lodash/fp';
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
import { Button, Icon, Typography } from 'ui-kit';
import {
  CONFIRMATIONS,
  GAS_LIMIT,
  GENESIS_POOL_WORKERS,
  TRANSACTION_KEY,
} from '../../const';
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
  const {
    name,
    address,
    worker_state,
    delegate_policy,
    org_name,
    org_email,
    org_desc,
  } = selectedWorker;
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
    if (worker_state && worker_state !== 'BONDED') {
      setStake(StakeType.Unstake);
    }
  }, [worker_state]);

  useEffect(() => {
    if (db && account) {
      const accountRef = db.collection('accountsMeta').doc(account);
      accountRef.get().then((doc: any) => {
        setAccountTOC(doc.exists);
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
    writeToDB();
    setModal(Modal.confirm);
  };

  const prepareUnstake = () => {
    writeToDB();
    handleUnstake();
  };

  const writeToDB = async () => {
    if (db && isGenesis && !accountTOC) {
      const ipv4 = await publicIp.v4();
      const time = firebase.firestore.FieldValue.serverTimestamp();
      const data = { ip: ipv4, collectedAt: time };
      db.collection('accounts')
        .doc(account)
        .set(data)
        .then(() => {
          db.collection('accountsMeta').doc(account).set({ collected: true });
        });
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
    if (isGenesis && accountTOC) {
      isUnstake ? prepareUnstake() : setModal(Modal.confirm);
    } else {
      setModal(isUnstake ? Modal.agreementUnstake : Modal.agreementStake);
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
      <div className={css.desc}>
        <div className={css.currentStake}>
          <div>
            <Typography type="subtitle" theme="white">
              Personal Stake
            </Typography>
            <div>
              <Typography type="subtitle" theme="white">
                {formattedPersonalStake}
              </Typography>
              <Typography type="bodyThin">VID</Typography>
            </div>
          </div>
        </div>
        <div>
          <Typography type="subtitle" theme="white">
            {org_name}
          </Typography>
          {org_email && (
            <a href={`mailto:${org_email}`} className={css.email}>
              <Icon name="email" color="#fff" />
              <Typography type="smallBodyThin">{org_email}</Typography>
            </a>
          )}
          <Typography type="smallBodyThin">{org_desc}</Typography>
        </div>
      </div>
      {delegate_policy && (
        <div className={css.delegatePolicy}>
          <Typography className={css.head} type="subtitleCaps">
            Delegate Payout Policy
          </Typography>
          <Typography>{delegate_policy}</Typography>
        </div>
      )}
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
