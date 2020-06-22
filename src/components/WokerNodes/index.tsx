import React, { useMemo } from 'react';
import { Typography, Spinner } from 'kit';
import { find, filter, reduce, map, flatten, groupBy, sortBy } from 'lodash/fp';
import { WorkerStatus } from 'const';
import useRequest from 'api/useRequest';
import store from 'store';
import { observer } from 'mobx-react-lite';
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
  const items = useMemo(() => {
    if (!data) return [];
    const items = data.items || [];
    const dataWithAddress = filter('address')(items);

    const splitData = reduce(
      (acc: any, { address, ...el }: any) => {
        const delegate = find({ delegatee: address }, delegations);
        if (delegate) {
          acc.withStake.push({
            ...el,
            address,
            personalStake: delegate.amount,
          });
        } else {
          acc.withoutStake.push({
            ...el,
            address,
          });
        }
        return acc;
      },
      {
        withStake: [],
        withoutStake: [],
      }
    )(dataWithAddress);

    const groupedByStatus = groupBy('status')(splitData.withoutStake);
    const sortedPersonalStake = sortBy('personalStake')(splitData.withStake);
    return flatten([
      sortedPersonalStake,
      groupedByStatus[WorkerStatus.BUSY] || [],
      groupedByStatus[WorkerStatus.IDLE] || [],
      groupedByStatus[WorkerStatus.NEW] || [],
      groupedByStatus[WorkerStatus.OFFLINE] || [],
    ]);
  }, [data, delegations]);
  if (!data) return <Spinner />;
  return (
    <div>
      <Typography type="title">Available Worker Pool Nodes</Typography>
      <Typography type="subtitleThin" opacity="drift">
        Select a worker node to stake your VideoCoin
      </Typography>
      <table className={css.table}>
        <TableHead />
        <tbody>{map(renderNode)(items)}</tbody>
      </table>
    </div>
  );
};

export default observer(WorkerNodes);
