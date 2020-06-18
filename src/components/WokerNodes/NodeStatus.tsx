import React from 'react';
import cn from 'classnames';
import css from './styles.module.scss';
import { readableWorkerStatus, WorkerStatus } from '../../const';

const NodeStatus = ({ status }: { status: WorkerStatus }) => {
  return (
    <div className={cn(css.status, css[status])}>
      {readableWorkerStatus[status]}
    </div>
  );
};

export default NodeStatus;
