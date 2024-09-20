// 3. deploy the governor that is the one who manages all the votes and (based on the votes) tells the timeLock that wants to do something
const { network, ethers } = require('hardhat');
const {
    developmentChains,
    VOTING_PERIOD,
    VOTING_DELAY,
    QUORUM_PERCENTAGE,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const governanceToken = await get('GovernanceToken');
    const timeLock = await get('TimeLock');

    const args = [
        governanceToken.address,
        timeLock.address,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
    ];

    log('----------------------------');
    log('Deploying governor...');
    const governorContract = await deploy('GovernorContract', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, args);
    }
    log('----------------------------');
};
