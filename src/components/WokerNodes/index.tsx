import { BigNumber } from '@ethersproject/bignumber';
import useRequest from 'api/useRequest';
import { GENESIS_POOL_WORKERS, WorkerStatus } from 'const';
import {
  compose,
  filter,
  find,
  flatten,
  groupBy,
  map,
  reduce,
  reverse,
  sortBy,
} from 'lodash/fp';
import { observer } from 'mobx-react-lite';
import React from 'react';
import store from 'store';
import { Spinner, Typography } from 'ui-kit';
import NodeRow from './NodeRow';
import css from './styles.module.scss';

const apiURL = process.env.REACT_APP_API_URL;
const POLL_TIMEOUT = 10_000;
const renderNode = (node: any) => <NodeRow key={node.id} node={node} />;

const fields = ['Status', 'Name', 'Address', 'Personal Stake'];

const TableHead = () => {
  const renderCell = (name: string) => (
    <th key={name}>
      <Typography type="smallBody">{name}</Typography>
    </th>
  );
  return (
    <thead>
      <tr>{map(renderCell, fields)}</tr>
    </thead>
  );
};

const WorkerNodes = () => {
  const { delegations } = store;
  const { data } = useRequest<{ items: Worker[] }>(
    {
      url: `${apiURL}/miners/all`,
    },
    {
      refreshInterval: POLL_TIMEOUT,
    }
  );
  const items = () => {
    if (!data)
      return {
        genesisPool: [],
        cash: [],
      };
    const items = data.items || [];
    const dataWithAddress = filter(
      // eslint-disable-next-line
      ({ is_internal, address, worker_state }) =>
        // eslint-disable-next-line
        !is_internal && address
    )(items);

    const splitData = reduce(
      // eslint-disable-next-line
      (
        acc: any,
        { address, worker_state, allow_thirdparty_delegates, ...el }: any
      ) => {
        const delegate = find({ delegatee: address }, delegations);
        const isGenesis = GENESIS_POOL_WORKERS.includes(address);
        // eslint-disable-next-line
        const allowDelegates =
          worker_state === 'BONDED' && allow_thirdparty_delegates;
        if (isGenesis && allowDelegates) {
          acc.genesisPool.push({
            ...el,
            address,
            // eslint-disable-next-line
            worker_state,
            allow_thirdparty_delegates,
            personalStake: delegate?.amount ?? 0,
          });
          return acc;
        }
        if (delegate && allowDelegates) {
          acc.withStake.push({
            ...el,
            address,
            // eslint-disable-next-line
            worker_state,
            allow_thirdparty_delegates,
            personalStake: delegate.amount,
          });
          return acc;
        } else if (delegate && BigNumber.from(delegate.amount).gt(0)) {
          if (isGenesis) {
            acc.genesisPool.push({
              ...el,
              address,
              // eslint-disable-next-line
              worker_state,
              allow_thirdparty_delegates,
              personalStake: delegate?.amount ?? 0,
            });
          } else {
            acc.toUnstake.push({
              ...el,
              address,
              // eslint-disable-next-line
              worker_state,
              allow_thirdparty_delegates,
              personalStake: delegate.amount,
            });
          }
        }
        if (allowDelegates) {
          acc.withoutStake.push({
            ...el,
            // eslint-disable-next-line
            worker_state,
            allow_thirdparty_delegates,
            address,
          });
        }
        return acc;
      },
      {
        withStake: [],
        toUnstake: [],
        withoutStake: [],
        genesisPool: [],
      }
    )(dataWithAddress);

    const groupedByStatus = groupBy('status')(splitData.withoutStake);
    const sortedPersonalStake = compose(
      reverse,
      sortBy('personalStake')
    )(splitData.withStake);
    const sortedUnstakeOnly = compose(
      reverse,
      sortBy('personalStake')
    )(splitData.toUnstake);
    return {
      genesisPool: splitData.genesisPool,
      cash: flatten([
        sortedPersonalStake,
        sortedUnstakeOnly,
        groupedByStatus[WorkerStatus.BUSY] || [],
        groupedByStatus[WorkerStatus.IDLE] || [],
        groupedByStatus[WorkerStatus.NEW] || [],
        groupedByStatus[WorkerStatus.OFFLINE] || [],
      ]),
    };
  };
  if (!data) return <Spinner />;
  return (
    <div>
      <Typography type="title">Available Worker Pool Nodes</Typography>
      <Typography type="subtitleThin" opacity="drift">
        Select a worker node to stake your VideoCoin
      </Typography>
      <Typography className={css.head} type="subtitleCaps">
        Genesis Program Staking
      </Typography>
      <Typography className={css.programDesc} opacity="drift">
        Earn VID rewards for staking VID onto our Genesis Program worker pool
      </Typography>
      <table className={css.table}>
        <TableHead />
        <tbody>{map(renderNode)(items().genesisPool)}</tbody>
      </table>
      <Typography className={css.head} type="subtitleCaps">
        Cash Reward Staking
      </Typography>
      <Typography className={css.programDesc} opacity="drift">
        The VideoCoin Network does not manage rewards for VID staked on third
        party worker nodes. View each worker’s rewards policy to see what
        rewards will be paid out.
      </Typography>
      <table className={css.table}>
        <TableHead />
        <tbody>{map(renderNode)(items().cash)}</tbody>
      </table>
    </div>
  );
};

export default observer(WorkerNodes);
