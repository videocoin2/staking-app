import { Contract, ContractInterface } from '@ethersproject/contracts';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';

export default function contract(
  address: string,
  abi: ContractInterface,
  provider: Web3Provider | JsonRpcProvider
): Contract {
  return new Contract(address, abi, provider);
}
