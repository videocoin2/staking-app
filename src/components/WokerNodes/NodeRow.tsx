import { formatToken } from 'lib/units';
import React from 'react';
import { Typography } from 'ui-kit';
import { GENESIS_POOL_WORKERS } from '../../const';
import store from '../../store';
import NodeStatus from './NodeStatus';
import css from './styles.module.scss';

const NodeRow = ({ node }: { node: any }) => {
  const { status, name, address, personalStake = 0 } = node;
  const { selectWorker } = store;
  const handleSelect = () => selectWorker(node);
  const formattedPersonalStake = formatToken(personalStake);
  const isGenesis = GENESIS_POOL_WORKERS.includes(address);
  return (
    <tr onClick={handleSelect}>
      <td>
        <NodeStatus status={status} />
      </td>
      <td>
        <Typography type="body">{name}</Typography>
      </td>
      <td>
        <div className={css.addressCell}>
          {isGenesis && (
            <Typography className={css.genesisBadge} type="tiny" theme="white">
              Genesis Pool
            </Typography>
          )}
          <Typography>{address}</Typography>
        </div>
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
