import { BigNumberish } from '@ethersproject/bignumber';
import axios from 'axios';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { action, observable, reaction } from 'mobx';
const DELEGATIONS_API_URL = process.env.REACT_APP_DELEGATIONS_API_URL;
const STORE_CONFIG = process.env.REACT_APP_STORE_CONFIG;

export interface Delegate {
  amount: string;
  cursor: string;
  delegatee: string;
}

class Store {
  constructor() {
    this.checkMetaMask();
    this.initFirestore();
    reaction(() => this.account, this.fetchDelegations);
  }
  @observable
  isMetamaskInstalled = false;

  @observable
  selectedWorker: any = null;

  @observable
  vidBalance: BigNumberish = 0;

  @observable
  ethBalance: BigNumberish = 0;

  @observable
  token: any = null;

  @observable
  account = '';

  @observable
  totalStake = '';

  @observable
  db: any = null;

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
  setVidBalance = (balance: BigNumberish) => {
    this.vidBalance = balance;
  };

  @action
  setEthBalance = (balance: BigNumberish) => {
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
    const res = await axios(`${DELEGATIONS_API_URL}/${this.account}`);
    this.delegations.replace(res.data.delegations);
    this.totalStake = res.data.total;
    return res;
  };

  @action
  initFirestore = async () => {
    const app = firebase.initializeApp(JSON.parse(STORE_CONFIG));
    this.db = app.firestore();
  };
}

const store = new Store();

export default store;
