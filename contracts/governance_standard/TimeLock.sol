// additional contract that is the owner of the Box contract
// each time we propose or queue something, we want to wait for a new vote to be "executed"
// gives time to users to "get out" if they dont like a governance update
// so when a proposal happens it wont go in effect right away
// the proposal will be aproved and users will have time to "get out"

// logic: The governance contract proposes something to the timeLock, once is in the timelock and it waits that period, anybody can go ahead an execute it.
// Everybody votes on everything and once they vote is passes. Governor says to timeLock: can you please propose this? timelock says: yes but we have to wait the minDelay. Once the minDelay passes, everybody can execute it.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/governance/TimelockController.sol';

contract TimeLock is TimelockController {
    /**
     *
     * @param minDelay how long you have to wait before executing (once a proposal passes we have to wait the minDelay)
     * @param proposers list of addresses that can propose
     * @param executors who can execute when a proposal passes
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers, // only allow the proposer to be the governor contract (he should be the only one who proposes things)
        address[] memory executors // anybody should be able to execute
    ) TimelockController(minDelay, proposers, executors, msg.sender) {}
}
