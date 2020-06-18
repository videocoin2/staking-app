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
