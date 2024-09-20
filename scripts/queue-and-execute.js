// 3. if the proposal passes, we queue and execute
// 2. once a proposal is in, we can start vote if we want the proposal to happen or not
const { ethers, network } = require('hardhat');
const {
    proposalsFile,
    developmentChains,
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
} = require('../helper-hardhat-config');
const { moveBlocks } = require('../utils/move-blocks');
const { moveTime } = require('../utils/move-time');
const fs = require('fs');

async function queueAndExecute() {
    const chainId = network.config.chainId;
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
    const governor = await ethers.getContract('GovernorContract');

    // ------------------- QUEUE ------------------- //
    // takes the same parameters as propose (but instead of looking for the description, it looks for the description hash)
    const args = [NEW_STORE_VALUE];
    const box = await ethers.getContract('Box');
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION));

    console.log('Queueing...');
    const queueTx = await governor.queue([box.target], [0], [encodedFunctionCall], descriptionHash);
    await queueTx.wait(1);

    // once a proposal is queued, we have to wait the minDelay for giving people time to get out if they dont like the proposal:
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }

    // ------------------- EXECUTE ------------------- //
    console.log('Executing...');
    // takes the same parameters as queue
    const executeTx = await governor.execute(
        [box.target],
        [0],
        [encodedFunctionCall],
        descriptionHash,
    );
    await executeTx.wait(1);

    const boxNewValue = await box.retrieve();
    console.log(`New Box Value: ${boxNewValue.toString()}`);
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
