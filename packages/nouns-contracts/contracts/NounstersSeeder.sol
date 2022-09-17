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
    mapping(uint256 => uint256) internal _bodyStart;
    mapping(uint256 => uint256) internal _accessoryStart;
    mapping(uint256 => uint256) internal _headStart;
    mapping(uint256 => uint256) internal _glassesStart;

    function populateMonsterTypes(uint256[][] calldata monsterStarts) external override {
        monsterTypes = monsterStarts.length;

        for (uint256 i = 0; i < monsterTypes; i++) {
            _glassesStart[i] = monsterStarts[i][3];
            _headStart[i] = monsterStarts[i][2];
            _accessoryStart[i] = monsterStarts[i][1];
            _bodyStart[i] = monsterStarts[i][0];
        }
    }

    function grabTypeStarts(uint256 typeId)
        external
        view
        returns (
            uint256 bodyStart,
            uint256 accessoryStart,
            uint256 headStart,
            uint256 glassesStart
        )
    {
        return (_bodyStart[typeId], _accessoryStart[typeId], _headStart[typeId], _glassesStart[typeId]);
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

        uint256 _monsterType = uint256(uint16(pseudorandomness) % monsterTypes);

        return Seed({
            background: uint48(
                (uint48(pseudorandomness >> 16) % backgroundCount)
            ),
            body: uint48(
                ((uint48(pseudorandomness >> 64) % bodyCount) + _bodyStart[_monsterType])
            ),
            accessory: uint48(
                ((uint48(pseudorandomness >> 112) % accessoryCount) + _accessoryStart[_monsterType])
            ),
            head: uint48(
                ((uint48(pseudorandomness >> 160) % headCount) + _headStart[_monsterType])
            ),
            glasses: uint48(
                ((uint48(pseudorandomness >> 208) % glassesCount) + _glassesStart[_monsterType])
            )
        });
    }
}
