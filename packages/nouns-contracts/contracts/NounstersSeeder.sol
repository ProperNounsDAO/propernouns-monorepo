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
    mapping(uint256 => uint256[]) internal _bodyStart;
    mapping(uint256 => uint256[]) internal _accessoryStart;
    mapping(uint256 => uint256[]) internal _headStart;
    mapping(uint256 => uint256[]) internal _glassesStart;

    function populateMonsterTypes(uint256[][][] calldata monsterStarts) external override {
        monsterTypes = monsterStarts.length;

        for (uint256 i = 0; i < monsterTypes; i++) {
            _glassesStart[i] = monsterStarts[i][3];
            _headStart[i] = monsterStarts[i][2];
            _accessoryStart[i] = monsterStarts[i][1];
            _bodyStart[i] = monsterStarts[i][0];
        }
    }

    function grabTypeRanges(uint256 typeId)
        external
        view
        returns (
            uint256[] memory bodyStart,
            uint256[] memory accessoryStart,
            uint256[] memory headStart,
            uint256[] memory glassesStart
        )
    {
        return (_bodyStart[typeId], _accessoryStart[typeId], _headStart[typeId], _glassesStart[typeId]);
    }

    /**
     * @notice Get the number of available Nounster `bodies` for a given NounsterType.
     */
    function bodiesCount(uint256 nounsterType) public view returns (uint256) {
        return uint256((_bodyStart[nounsterType][1] - _bodyStart[nounsterType][0]) + 1);
    }

    /**
     * @notice Get the number of available Nounster `accessories` for a given NounsterType.
     */
    function accessoriesCount(uint256 nounsterType) public view returns (uint256) {
        return uint256((_accessoryStart[nounsterType][1] - _accessoryStart[nounsterType][0]) + 1);
    }

    /**
     * @notice Get the number of available Nounster `heads` for a given NounsterType.
     */
    function headsCount(uint256 nounsterType) public view returns (uint256) {
        return uint256((_headStart[nounsterType][1] - _headStart[nounsterType][0]) + 1);
    }

    /**
     * @notice Get the number of available Nounster `glasses` for a given NounsterType.
     */
    function glassesCount(uint256 nounsterType) public view returns (uint256) {
        return uint256((_glassesStart[nounsterType][1] - _glassesStart[nounsterType][0]) + 1);
    }

    // prettier-ignore
    function generateSeed(uint256 nounId, INounsDescriptor descriptor) external view override returns (Seed memory) {
        uint256 pseudorandomness = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))
        );
        uint256 _nounsterType = uint256(((uint16(pseudorandomness)) % monsterTypes));

        uint256 backgroundCount = descriptor.backgroundCount();

        return Seed({
            background: uint48(
                (uint48(pseudorandomness >> 16) % backgroundCount)
            ),
            body: uint48(
                ((uint48(pseudorandomness >> 64) % bodiesCount(_nounsterType)) + _bodyStart[_nounsterType][0])
            ),
            accessory: uint48(
                ((uint48(pseudorandomness >> 112) % accessoriesCount(_nounsterType)) + _accessoryStart[_nounsterType][0])
            ),
            head: uint48(
                ((uint48(pseudorandomness >> 160) % headsCount(_nounsterType)) + _headStart[_nounsterType][0])
            ),
            glasses: uint48(
                ((uint48(pseudorandomness >> 208) % glassesCount(_nounsterType)) + _glassesStart[_nounsterType][0])
            )
        });
    }
}
