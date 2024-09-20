// token used to vote (based on ERC20)
// create normal ECR20 token and extend it to make it governanceable
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';

/**
 * @title Governance Token
 * @author Tristán Vaquero (Trigii)
 * @notice 1.0.0
 */
contract GovernanceToken is ERC20Votes {
    uint256 public s_maxSupply = 1000000000000000000000000; // 1 million tokens

    constructor() ERC20('GovernanceToken', 'GT') ERC20Permit('GovernanceToken') {
        _mint(msg.sender, s_maxSupply);
    }

    // required overrides
    // we want to make sure we always know how many tokens people have at different blocks/checkpoints
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount); // make sure that we are calling the _afterTokenTransfer of the ERC20Votes (to make sure that the snapshots are updated)
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}

/**
 * When we do votes, we need to be sure that is fair:
 * If someone knows a hot proposal is coming up,
 * So they can buy a lot of tokens and then they dump it after the vote is over
 *
 * To avoid this we can create a snapshot of how many tokens people have at a certain block -> ERC20Votes
 * So when there is a votation, we can do it from a certain checkpoint/snapshot/block so it doesent matter how many tokens they have bought in the last hours, that we are not taking them into account
 */
