export enum WorkerStatus {
  OFFLINE = 'OFFLINE',
  NEW = 'NEW',
  IDLE = 'IDLE',
  BUSY = 'BUSY',
}

export const readableWorkerStatus: Record<WorkerStatus, string> = {
  [WorkerStatus.BUSY]: 'Active',
  [WorkerStatus.IDLE]: 'Awaiting Work',
  [WorkerStatus.NEW]: 'New',
  [WorkerStatus.OFFLINE]: 'Offline',
};

export const TRANSACTION_KEY = 'transaction';

export const BALANCE_FETCH_INTERVAL = 3000;
export const GENESIS_POOL_WORKERS = [
  '0x6EBB37C387f073Db87f53A391a343D18044d534A',
  '0xa19c77AFD9ff3b698DB46C02e43F828c03dE2A6b',
];
