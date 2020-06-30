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
    if (!data) return [];
    const items = data.items || [];
    const dataWithAddress = filter(
      // eslint-disable-next-line
      ({ is_internal, address, worker_state }) =>
        // eslint-disable-next-line
        !is_internal && address
    )(items);

    const splitData = reduce(
      // eslint-disable-next-line
      (acc: any, { address, worker_state, ...el }: any) => {
        const delegate = find({ delegatee: address }, delegations);
        const isGenesis = GENESIS_POOL_WORKERS.includes(address);
        // eslint-disable-next-line
        const isBonded = worker_state === 'BONDED';
        if (isGenesis && isBonded) {
          acc.genesisPool.push({
            ...el,
            address,
            // eslint-disable-next-line
            worker_state,
            personalStake: delegate?.amount ?? 0,
          });
          return acc;
        }
        if (delegate && isBonded) {
          acc.withStake.push({
            ...el,
            address,
            // eslint-disable-next-line
            worker_state,
            personalStake: delegate.amount,
          });
          return acc;
        } else if (delegate && BigNumber.from(delegate.amount).gt(0)) {
          acc.toUnstake.push({
            ...el,
            address,
            // eslint-disable-next-line
            worker_state,
            personalStake: delegate.amount,
          });
        }
        if (isBonded) {
          acc.withoutStake.push({
            ...el,
            // eslint-disable-next-line
            worker_state,
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
    return flatten([
      splitData.genesisPool,
      sortedPersonalStake,
      sortedUnstakeOnly,
      groupedByStatus[WorkerStatus.BUSY] || [],
      groupedByStatus[WorkerStatus.IDLE] || [],
      groupedByStatus[WorkerStatus.NEW] || [],
      groupedByStatus[WorkerStatus.OFFLINE] || [],
    ]);
  };
  if (!data) return <Spinner />;
  return (
    <div>
      <Typography type="title">Available Worker Pool Nodes</Typography>
      <Typography type="subtitleThin" opacity="drift">
        Select a worker node to stake your VideoCoin
      </Typography>
      <table className={css.table}>
        <TableHead />
        <tbody>{map(renderNode)(items())}</tbody>
      </table>
    </div>
  );
};

export default observer(WorkerNodes);
