import { Contract } from 'ethers';

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 420,
  Kovan = 42,
}

// prettier-ignore
export type ContractName = 'NFTDescriptor' | 'NounsDescriptor' | 'NounstersSeeder' | 'NounsToken' | 'NounsAuctionHouse' | 'NounsAuctionHouseProxyAdmin' | 'NounsAuctionHouseProxy' | 'NounsDAOExecutor' | 'NounsDAOLogicV1' | 'NounsDAOProxy';

export interface ContractDeployment {
  args?: (string | number | (() => string))[];
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
  validateDeployment?: () => void;
}

export interface DeployedContract {
  name: string;
  address: string;
  instance: Contract;
  constructorArguments: (string | number)[];
  libraries: Record<string, string>;
}
