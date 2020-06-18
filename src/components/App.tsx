import React, { Suspense } from 'react';
import { Spinner } from 'kit';
import { observer } from 'mobx-react-lite';
import store from 'store';
import WorkerNodes from './WokerNodes';
import WorkerPage from './WorkerPage';

const App = () => {
  const { selectedWorker } = store;

  if (selectedWorker) {
    return <WorkerPage />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <WorkerNodes />
    </Suspense>
  );
};

export default observer(App);
