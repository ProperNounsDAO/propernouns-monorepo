// SPDX-License-Identifier: GPL-3.0

/// @title The NounsToken pseudo-random seed generator

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

import { INounstersSeeder } from './interfaces/INounstersSeeder.sol';
import { INounsDescriptor } from './interfaces/INounsDescriptor.sol';

contract NounstersSeeder is INounstersSeeder {
    /**
     * @notice Generate a pseudo-random Noun seed using the previous blockhash and noun ID.
     */

    uint256 internal monsterTypes;
    mapping(uint16 => uint256) internal _bodyStart;
    mapping(uint16 => uint256) internal _accessoryStart;
    mapping(uint16 => uint256) internal _headStart;
    mapping(uint16 => uint256) internal _glassesStart;

    function populateMonsterTypes(uint16[][] memory monsterStarts) external override {
        monsterTypes = monsterStarts.length;

        for (uint16 i = 0; i < monsterTypes; i++) {
            _bodyStart[i] = uint256(monsterStarts[i][0]);
            _accessoryStart[i] = uint256(monsterStarts[i][1]);
            _headStart[i] = uint256(monsterStarts[i][2]);
            _glassesStart[i] = uint256(monsterStarts[i][3]);
        }
    }

    // prettier-ignore
    function generateSeed(uint256 nounId, INounsDescriptor descriptor) external view override returns (Seed memory) {
        uint256 pseudorandomness = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))
        );

        uint256 backgroundCount = descriptor.backgroundCount();
        uint256 bodyCount = descriptor.bodyCount();
        uint256 accessoryCount = descriptor.accessoryCount();
        uint256 headCount = descriptor.headCount();
        uint256 glassesCount = descriptor.glassesCount();

        uint16 monsterType = uint16(uint16(pseudorandomness) % monsterTypes);

        return Seed({
            background: uint48(
                (uint48(pseudorandomness >> 16) % backgroundCount)
            ),
            body: uint48(
                (uint48(pseudorandomness >> 64) % bodyCount) + _bodyStart[monsterType]
            ),
            accessory: uint48(
                (uint48(pseudorandomness >> 112) % accessoryCount) + _accessoryStart[monsterType]
            ),
            head: uint48(
                (uint48(pseudorandomness >> 160) % headCount) + _headStart[monsterType]
            ),
            glasses: uint48(
                (uint48(pseudorandomness >> 208) % glassesCount) + _glassesStart[monsterType]
            )
        });
    }
}
