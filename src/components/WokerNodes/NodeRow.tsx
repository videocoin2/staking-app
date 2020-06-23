import { Typography } from 'ui-kit';
import { formatToken } from 'lib/units';
import React from 'react';
import store from '../../store';
import NodeStatus from './NodeStatus';
import css from './styles.module.scss';

const GENESIS_POOL_WORKERS = [
  '0x6EBB37C387f073Db87f53A391a343D18044d534A',
  '0xa19c77AFD9ff3b698DB46C02e43F828c03dE2A6b',
];

const NodeRow = ({ node }: { node: any }) => {
  const { status, name, address, personalStake = 0 } = node;
  const { selectWorker } = store;
  const handleSelect = () => selectWorker(node);
  const formattedPersonalStake = parseFloat(formatToken(personalStake)).toFixed(
    2
  );
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
