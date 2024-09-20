// 4. manage the timeLock configuration so:
// 1. the governor is the only one who can propose something to the timeLock
// 2. the executor is everybody
// 3. the deployer is no longer the admin of the timeLock (so nobody can manipulate and all actions go through governace)
const { ethers } = require('hardhat');
const { ADDRESS_ZERO } = require('../helper-hardhat-config');

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { log } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);

    const timeLock = await ethers.getContract('TimeLock', signer);
    const governor = await ethers.getContract('GovernorContract', signer);

    log('Setting up roles...');
    // setting the roles so only the governor can send things to the timelock (timeLock = president)
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    // the deployer currently is the adminRole so he owns the timeLock and we can do the grantRole operation:
    const proposerTx = await timeLock.grantRole(proposerRole, governor.target); // governor = proposer (the only one who can do anything with the timeLock)
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, governor.target); // executors = nobody == everybody // TODO: the role should be granted to "ADDRESS_ZERO" but we get an error
    await executorTx.wait(1);

    // current adminRole is the deployer (the deployer owns the timeLock) and we want to revoke it:
    const revokeTx = await timeLock.revokeRole(adminRole, signer);
    await revokeTx.wait(1);
    // anything that timelock wants to do has to go through governance. Nobody owns the timeLock so nobody can do any action unless there is governance
};
