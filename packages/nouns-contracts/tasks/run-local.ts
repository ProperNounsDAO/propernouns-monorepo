import { TASK_COMPILE, TASK_NODE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';

task(
  'run-local',
  'Start a hardhat node, deploy contracts, and execute setup transactions',
).setAction(async (_, { ethers, run }) => {
  await run(TASK_COMPILE);

  await Promise.race([run(TASK_NODE), new Promise(resolve => setTimeout(resolve, 2_000))]);

  const contracts = await run('deploy-local');

  await run('populate-descriptor', {
    nftDescriptor: contracts.NFTDescriptor.instance.address,
    nounsDescriptor: contracts.NounsDescriptor.instance.address,
    nounstersSeeder: contracts.NounstersSeeder.instance.address,
  });

  //await run('create-proposal', {
  //  nounsDaoProxy: contracts.NounsDAOProxy.instance.address,
  //});


  // Transfer ownership of all contract except for the auction house.
  // We must maintain ownership of the auction house to kick off the first auction.
  const executorAddress = contracts.NounsDAOExecutor.address;
  await contracts.NounsDescriptor.instance.transferOwnership(executorAddress);
  await contracts.NounsToken.instance.transferOwnership(executorAddress);
  await contracts.NounsAuctionHouseProxyAdmin.instance.transferOwnership(executorAddress);
  console.log(
    'Transferred ownership of the descriptor, token, and proxy admin contracts to the executor.',
  );

  const auctionHouse = contracts.NounsAuctionHouse.instance.attach(
    contracts.NounsAuctionHouseProxy.address,
  );
  await auctionHouse.unpause({
    gasLimit: 1_000_000,
  });
  await auctionHouse.transferOwnership(executorAddress);
  console.log(
    'Started the first auction and transferred ownership of the auction house to the executor.',
  );

  const { chainId } = await ethers.provider.getNetwork();

  const accounts = {
    'Account #0': {
      Address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      'Private Key': '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    'Account #1': {
      Address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      'Private Key': '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    },
  };

  console.table(accounts);
  console.log(
    `Noun contracts deployed to local node at http://localhost:8545 (Chain ID: ${chainId})`,
  );
  console.log(`Auction House Proxy address: ${contracts.NounsAuctionHouseProxy.instance.address}`);
  console.log(`Nouns ERC721 address: ${contracts.NounsToken.instance.address}`);
  console.log(`Nouns DAO Executor address: ${contracts.NounsDAOExecutor.instance.address}`);
  console.log(`Nouns DAO Proxy address: ${contracts.NounsDAOProxy.instance.address}`);

  await ethers.provider.send('evm_setIntervalMining', [12_000]);

  await new Promise(() => {
    /* keep node alive until this process is killed */
  });
});
