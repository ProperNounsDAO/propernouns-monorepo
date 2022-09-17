import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { NounSeed, NounData } from './types';
import { monstertypes, images, bgcolors } from './image-data.json';

const { bodies, accessories, heads, glasses } = images;

/**
 * Get encoded part and background information using a Noun seed
 * @param seed The Noun seed
 */
export const getNounData = (seed: NounSeed): NounData => {
  return {
    parts: [
      bodies[seed.body],
      accessories[seed.accessory],
      heads[seed.head],
      glasses[seed.glasses],
    ],
    background: bgcolors[seed.background],
  };
};

/**
 * Generate a random Noun seed
 * @param seed The Noun seed
 */
export const getRandomNounSeed = (): NounSeed => {
  const monstertype = Math.floor(Math.random() * monstertypes.length);
  const bodieslength = monstertypes[monstertype][0][1] - monstertypes[monstertype][0][0];
  const accessorieslength = monstertypes[monstertype][1][1] - monstertypes[monstertype][1][0];
  const headslength = monstertypes[monstertype][2][1] - monstertypes[monstertype][2][0];
  const glasseslength = monstertypes[monstertype][3][1] - monstertypes[monstertype][3][0];

  return {
    background: Math.floor(Math.random() * bgcolors.length),
    body: (Math.floor(Math.random() * bodieslength) + monstertypes[monstertype][0][0]),
    accessory: (Math.floor(Math.random() * accessorieslength) + monstertypes[monstertype][1][0]),
    head: (Math.floor(Math.random() * headslength) + monstertypes[monstertype][2][0]),
    glasses: (Math.floor(Math.random() * glasseslength) + monstertypes[monstertype][3][0]),
  };
};

/**
 * Emulate bitwise right shift and uint cast
 * @param value A Big Number
 * @param shiftAmount The amount to right shift
 * @param uintSize The uint bit size to cast to
 */
export const shiftRightAndCast = (
  value: BigNumberish,
  shiftAmount: number,
  uintSize: number,
): string => {
  const shifted = BigNumber.from(value).shr(shiftAmount).toHexString();
  return `0x${shifted.substring(shifted.length - uintSize / 4)}`;
};

/**
 * Emulates the NounstersSeeder.sol methodology for pseudorandomly selecting a part
 * @param pseudorandomness Hex representation of a number
 * @param partCount The number of parts to pseudorandomly choose from
 * @param shiftAmount The amount to right shift
 * @param uintSize The size of the unsigned integer
 */
export const getPseudorandomPart = (
  pseudorandomness: string,
  partCount: number,
  shiftAmount: number,
  uintSize: number = 48,
): number => {
  const hex = shiftRightAndCast(pseudorandomness, shiftAmount, uintSize);
  return BigNumber.from(hex).mod(partCount).toNumber();
};

/**
 * Emulates the NounstersSeeder.sol methodology for generating a Noun seed
 * @param nounId The Noun tokenId used to create pseudorandomness
 * @param blockHash The block hash use to create pseudorandomness
 */
export const getNounSeedFromBlockHash = (nounId: BigNumberish, blockHash: string): NounSeed => {
  const pseudorandomness = solidityKeccak256(['bytes32', 'uint256'], [blockHash, nounId]);
  const monstertype = Math.floor(Math.random() * monstertypes.length);
  const bodieslength = monstertypes[monstertype][0][1] - monstertypes[monstertype][0][0];
  const accessorieslength = monstertypes[monstertype][1][1] - monstertypes[monstertype][1][0];
  const headslength = monstertypes[monstertype][2][1] - monstertypes[monstertype][2][0];
  const glasseslength = monstertypes[monstertype][3][1] - monstertypes[monstertype][3][0];

  return {
    background: getPseudorandomPart(pseudorandomness, bgcolors.length, 0),
    body: getPseudorandomPart(pseudorandomness, bodieslength, 48) + monstertypes[monstertype][0][0],
    accessory: getPseudorandomPart(pseudorandomness, accessorieslength, 96) + monstertypes[monstertype][0][0],
    head: getPseudorandomPart(pseudorandomness, headslength, 144) + monstertypes[monstertype][0][0],
    glasses: getPseudorandomPart(pseudorandomness, glasseslength, 192) + monstertypes[monstertype][0][0],
  };
};
