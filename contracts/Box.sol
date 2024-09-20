// contract where we have governance
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/access/Ownable.sol';

contract Box is Ownable {
    // variables
    uint256 private s_value;

    // events
    event Box__ValueChanged(uint256 newValue);

    constructor() Ownable() {}

    // functions
    function store(uint256 newValue) public {
        s_value = newValue;
        emit Box__ValueChanged(newValue);
    }

    function retrieve() public view returns (uint256) {
        return s_value;
    }
}
