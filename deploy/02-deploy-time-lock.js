// 2. deploy the timeLock controller (controls everything) with the following config:
// current adminRole = deployer
// current proposers/executors = empty
const { network, ethers } = require('hardhat');
const { developmentChains, MIN_DELAY } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [MIN_DELAY, [], []]; // initialize the proposers and executors empty

    log('----------------------------');
    log('Deploying TimeLock...');
    const timeLock = await deploy('TimeLock', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(timeLock.address, args);
    }
    log('----------------------------');
};
