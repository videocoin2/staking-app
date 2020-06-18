import { observable, action, reaction } from 'mobx';
import axios from 'axios';
import { formatEther } from '@ethersproject/units';

export interface Delegate {
  amount: string;
  cursor: string;
  delegatee: string;
}

class Store {
  constructor() {
    this.checkMetaMask();
    reaction(() => this.account, this.fetchDelegations);
  }
  @observable
  isMetamaskInstalled = false;

  @observable
  selectedWorker: any = null;

  @observable
  vidBalance: any = 0;

  @observable
  ethBalance: number = 0;

  @observable
  token: any = null;

  @observable
  account: string = '';

  @observable
  totalStake: string = '';

  delegations = observable.array<Delegate>([], { deep: false });

  @action
  setToken = (token: any) => {
    this.token = token;
  };

  @action
  setAccount = (account: string) => {
    this.account = account;
  };

  @action
  setVidBalance = (balance: number) => {
    if (!balance) return;
    this.vidBalance = +formatEther(balance);
  };
  @action
  setEthBalance = (balance: number) => {
    this.ethBalance = balance;
  };

  @action
  checkMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      this.isMetamaskInstalled = true;
    }
  }

  @action
  selectWorker = (worker: any) => {
    this.selectedWorker = worker;
  };

  @action
  fetchDelegations = async () => {
    if (!this.account) return;
    const res = await axios(
      `https://symphony.dev.videocoin.net/api/v1/delegations/${this.account}`
    );
    this.delegations.replace(res.data.delegations);
    this.totalStake = res.data.total;
  };
}

const store = new Store();

export default store;
