import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data.json';
import { chunkArray } from '../utils';

task('populate-descriptor', 'Populates the descriptor with color palettes and Noun parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptor` contract address',
    '0xFeD5B842271D943c8820dFf123C43266f349e833',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptor` contract address',
    '0xD99b43332994F755072d5cdAB87992aF8423DeC0',
    types.string,
  )
  .addOptionalParam(
    'nounstersSeeder',
    'The `NounstersSeeder` contract address',
    '0x0E760D9e188E91C80418e7f5F3adD2F857EC7477',
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

    console.log([bodies.length, accessories.length, heads.length, glasses.length]);
    // Chunk head and accessory population due to high gas usage
    await descriptorContract.addManyBackgrounds(bgcolors);
    await descriptorContract.addManyColorsToPalette(0, palette);

    //await descriptorContract.addManyBodies(bodies.map(({ data }) => data));
    const bodyChunk = chunkArray(bodies, 10);
    for (const chunk of bodyChunk) {
      await descriptorContract.addManyBodies(chunk.map(({ data }) => data));
    }
    const accessoryChunk = chunkArray(accessories, 10);
    for (const chunk of accessoryChunk) {
      await descriptorContract.addManyAccessories(chunk.map(({ data }) => data));
    }

    const headChunk = chunkArray(heads, 10);
    for (const chunk of headChunk) {
      await descriptorContract.addManyHeads(chunk.map(({ data }) => data));
    }

    //await descriptorContract.addManyGlasses(glasses.map(({ data }) => data));
    const glassesChunk = chunkArray(glasses, 10);
    for (const chunk of glassesChunk) {
      await descriptorContract.addManyGlasses(chunk.map(({ data }) => data));
    }

    await seederContract.populateMonsterTypes(monstertypes);
    console.log('Descriptor populated with palettes and parts.');
  });
