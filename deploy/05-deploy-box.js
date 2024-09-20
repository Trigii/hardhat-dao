// 5. deploy the contract that we actually want to govern over
const { network, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log('----------------------------');
    log('Deploying Box...');
    // this "box" variable is the deployment object (not the contract instance)
    const box = await deploy('Box', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(box.address, args);
    }
    log('----------------------------');

    // deployer has deployed this, NOT timeLock, so we want to give the Box ownership to the governance process (timeLock)
    const timeLock = await ethers.getContract('TimeLock');
    const boxContract = await ethers.getContractAt('Box', box.address);
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.target);
    await transferOwnerTx.wait(1);
    console.log('Box ownership transferd to TimeLock successfully');
};
