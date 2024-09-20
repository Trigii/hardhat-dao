// 2. once a proposal is in, we can start vote if we want the proposal to happen or not
const { ethers, network } = require('hardhat');
const { proposalsFile, developmentChains, VOTING_PERIOD } = require('../helper-hardhat-config');
const { moveBlocks } = require('../utils/move-blocks');
const fs = require('fs');

async function vote() {
    const chainId = network.config.chainId;
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
    const governor = await ethers.getContract('GovernorContract');

    const proposalId = proposals[chainId]; // get the proposal
    console.log(proposalId);
    // 0 = Against; 1 = For; 2 = Abstain
    const voteWay = 1; // we want to change the box to 77
    const reason = 'I like that number!';
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason);
    await voteTxResponse.wait(1);

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }
    console.log('You have voted!');
}

module.exports = {
    vote,
};

vote()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
