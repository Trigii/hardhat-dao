// 1. deploy the token that is going to be used by the users to vote
const { network, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('----------------------------');
    log('Deploying Governance Token...');
    const governanceToken = await deploy('GovernanceToken', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceToken.address, args);
    }
    log('----------------------------');

    // when we deploy this contract, nobody has voting power (nobody has the token delegated to them -> we are going to delegate the token to our deployer)
    await delegate(governanceToken.address, deployer);
    log('Delegated');
};

// when somebody calls this function is saying "take my votes and vote however you want"
const delegate = async (governanceTokenAddress, delegatedAccount) => {
    const governanceToken = await ethers.getContractAt('GovernanceToken', governanceTokenAddress);
    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};
