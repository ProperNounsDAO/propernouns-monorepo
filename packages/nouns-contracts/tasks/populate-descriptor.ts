import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data.json';
import { chunkArray } from '../utils';

task('populate-descriptor', 'Populates the descriptor with color palettes and Noun parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptor` contract address',
    '0x07c6deCfB71416D77b1671050B2555c8176f5D1b',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptor` contract address',
    '0x1F952ad1Ba8d94F897F0585cDe846c5306B87fE9',
    types.string,
  )
  .addOptionalParam(
    'nounstersSeeder',
    'The `NounstersSeeder` contract address',
    '0x1F952ad1Ba8d94F897F0585cDe846c5306B87fE9',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor, nounstersSeeder }, { ethers }) => {
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptor', {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    });
    const seederFactory = await ethers.getContractFactory('NounstersSeeder');
    const seederContract = seederFactory.attach(nounstersSeeder);
    const descriptorContract = descriptorFactory.attach(nounsDescriptor);

    const { monstertypes, bgcolors, palette, images } = ImageData;
    const { bodies, accessories, heads, glasses } = images;

    // Chunk head and accessory population due to high gas usage
    await descriptorContract.addManyBackgrounds(bgcolors);
    await descriptorContract.addManyColorsToPalette(0, palette);
    await descriptorContract.addManyBodies(bodies.map(({ data }) => data));

    const accessoryChunk = chunkArray(accessories, 10);
    for (const chunk of accessoryChunk) {
      await descriptorContract.addManyAccessories(chunk.map(({ data }) => data));
    }

    const headChunk = chunkArray(heads, 10);
    for (const chunk of headChunk) {
      await descriptorContract.addManyHeads(chunk.map(({ data }) => data));
    }

    await descriptorContract.addManyGlasses(glasses.map(({ data }) => data));

    console.log('Descriptor populated with palettes and parts.');


    await seederContract.populateMonsterTypes(monstertypes);
    console.log("Verifying seeds...")
    const seedReceipt = await seederContract.generateSeed(0, descriptorContract.address);
    console.log(seedReceipt)
    const seedTypes0 = await seederContract.grabTypeStarts(0);
    const seedTypes1 = await seederContract.grabTypeStarts(1);
    const seedTypes2 = await seederContract.grabTypeStarts(2);
    const seedTypes3 = await seederContract.grabTypeStarts(3);
    const seedTypes4 = await seederContract.grabTypeStarts(4);
    //console.table([seedTypes0, seedTypes1, seedTypes2, seedTypes3, seedTypes4])
    console.log(seedTypes0[0].toString(), seedTypes0[1].toString(), seedTypes0[2].toString(), seedTypes0[3].toString());
    console.log(seedTypes1[0].toString(), seedTypes1[1].toString(), seedTypes1[2].toString(), seedTypes1[3].toString());
    console.log(seedTypes2[0].toString(), seedTypes2[1].toString(), seedTypes2[2].toString(), seedTypes2[3].toString());
    console.log(seedTypes3[0].toString(), seedTypes3[1].toString(), seedTypes3[2].toString(), seedTypes3[3].toString());
    console.log(seedTypes4[0].toString(), seedTypes4[1].toString(), seedTypes4[2].toString(), seedTypes4[3].toString());
  });
