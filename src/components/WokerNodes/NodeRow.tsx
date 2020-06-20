import { Typography } from 'kit';
import { formatToken } from 'lib/units';
import React from 'react';
import store from '../../store';
import NodeStatus from './NodeStatus';

const NodeRow = ({ node }: { node: any }) => {
  const { status, name, address, personalStake = 0 } = node;
  const { selectWorker } = store;
  const handleSelect = () => selectWorker(node);
  const formattedPersonalStake = parseFloat(formatToken(personalStake)).toFixed(
    2
  );
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
          {formattedPersonalStake}
        </Typography>{' '}
        <Typography tagName="span" type="caption">
          VID
        </Typography>
      </td>
    </tr>
  );
};

export default NodeRow;
