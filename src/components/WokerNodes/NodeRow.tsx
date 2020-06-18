import React from 'react';
import NodeStatus from './NodeStatus';
import { Typography } from 'kit';
import store from '../../store';

const NodeRow = ({ node }: { node: any }) => {
  const { status, name, address, personalStake = 0 } = node;
  const { selectWorker } = store;
  const handleSelect = () => selectWorker(node);
  return (
    <tr onClick={handleSelect}>
      <td>
        <NodeStatus status={status} />
      </td>
      <td>
        <Typography type="body">{name}</Typography>
      </td>
      <td>
        <Typography>{address}</Typography>
      </td>
      <td>
        <Typography tagName="span" type="smallBody">
          {personalStake}
        </Typography>{' '}
        <Typography tagName="span" type="caption">
          VID
        </Typography>
      </td>
    </tr>
  );
};

export default NodeRow;
