const { ethers, network } = require('hardhat');
const {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    developmentChains,
    VOTING_DELAY,
    proposalsFile,
} = require('../helper-hardhat-config');
const { moveBlocks } = require('../utils/move-blocks');
const fs = require('fs');

// 1. propose that our Box contract stores the value 77
async function propose(functionToCall, args, proposalDescription) {
    const governor = await ethers.getContract('GovernorContract');
    const box = await ethers.getContract('Box');
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args); // encode a function with its arguments so we can make the proposal
    const chainId = network.config.chainId;

    console.log(`Proposing ${functionToCall} on ${box.target} with ${args}`);
    console.log(`Proposal Description\n ${proposalDescription}`);
    const proposeTx = await governor.propose(
        [box.target], // target contracts where we want to create the proposal
        [0], // transaction values (we dont want to send ETH so its 0)
        [encodedFunctionCall], // encoded function and arguments that we want to call
        proposalDescription, // proposal description
    );
    const proposeReceipt = await proposeTx.wait(1); // the propose function and proposeTx emits an event that contains a proposalId (we need it for voting)

    // if we are on a development chain we need to mine blocks manually
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1);
    }

    const proposalId = proposeReceipt.logs[0].args[0];
    console.log(proposalId);

    // we jave to save the proposalId on a file so the other scripts (vote and queue-and-execute) know the proposals
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
    if (proposalId in proposals) {
        if (!proposals[chainId].includes(proposalId)) {
            proposals[chainId].push(proposalId.toString());
        }
    } else {
        proposals[chainId] = proposalId.toString();
    }
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

module.exports = {
    propose,
};

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
