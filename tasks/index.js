const { ROUTER_ADDRESS, MIST_ADDRESS, BAR_ADDRESS, /* SABLIER_ADDRESS */ } = require('@mistswapdex/sdk');

const { task } = require("hardhat/config")

const { ethers: { constants: { MaxUint256 }}} = require("ethers")

task("accounts", "Prints the list of accounts", require("./accounts"))
task("snapshot", "Prints the list of snapshot commands", require("./snapshot"))
task("gas-price", "Prints gas price").setAction(async function({ address }, { ethers }) {
  console.log("Gas price", (await ethers.provider.getGasPrice()).toString())
})

task("bytecode", "Prints bytecode").setAction(async function({ address }, { ethers }) {
  console.log("Bytecode", await ethers.provider.getCode(address))
})

task("erc20:transfer", "ERC20 transfer")
.addParam("token", "Token")
.addParam("amount", "Amount")
.addParam("recipient", "Recipient")
.setAction(async function ({ token, amount, recipient }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)

  console.log((await (await slp.connect(await getNamedSigner("dev")).transfer(recipient, amount)).wait()).transactionHash);
});

task("erc20:approve", "ERC20 approve")
.addParam("token", "Token")
.addParam("spender", "Spender")
.addOptionalParam("deadline", MaxUint256)
.setAction(async function ({ token, spender, deadline }, { ethers: { getNamedSigner } }, runSuper) {
  const erc20 = await ethers.getContractFactory("UniswapV2ERC20")

  const slp = erc20.attach(token)

  await (await slp.connect(await getNamedSigner("dev")).approve(spender, deadline)).wait()
});

task("bar:enter", "DomainBar enter")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const domain = await ethers.getContract("DomainToken")

  const bar = await ethers.getContract("DomainBar")

  await run("erc20:approve", { token: domain.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).enter(amount)).wait()
});

task("bar:leave", "DomainBar leave")
.addParam("amount", "Amount")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const domain = await ethers.getContract("DomainToken")

  const bar = await ethers.getContract("DomainBar")

  await run("erc20:approve", { token: domain.address, spender: bar.address })

  await (await bar.connect(await getNamedSigner("dev")).leave(amount)).wait()
});


task("receiver:convert", "Convert bch to rebuy domain for domain bar")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const receiver = await ethers.getContract("ENSBCHReceiver")

  const ETHRegistrarController = "0x0"; // TODO set from sdk

  const withdraw = await (await receiver.connect(await getNamedSigner("dev")).callTarget(
    ETHRegistrarController,
    "0",
    "withdraw()",
    encodeParameters([], []),
  {
    gasPrice: 1050000000,
    gasLimit: 5198000,
  })).wait()
  console.log('withdraw', withdraw.transactionHash)

  const served = await (await converter.connect(await getNamedSigner("dev")).convert()).wait()
  console.log('converted', served.transactionHash)
});

task("converter:stake", "Stake")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const converter = await ethers.getContract("MistBarConverter")
  const staked = await (await converter.connect(await getNamedSigner("dev")).stakeDomain()).wait()
  console.log('staked', staked.transactionHash)
});

task("converter:convert", "Convert to mist bar")
.setAction(async function ({ amount }, { ethers: { getNamedSigner } }, runSuper) {
  const converter = await ethers.getContract("MistBarConverter")
  const served = await (await converter.connect(await getNamedSigner("dev")).convert()).wait()
  console.log('converted', served.transactionHash)
});

task("vesting:create", "Create new vesting")
.addParam("recipient", "Address of recipient")
.addParam("token", "Token contract address")
.addParam("amount", "Amount of tokens in wei")
.addParam("timelength", "Time in seconds")
.setAction(async function ({
  recipient,
  token,
  amount,
  timelength,
}, { ethers: { getNamedSigner } }, runSuper) {
  // TODO check deposit is multiple of time delta
  // divide the fixed deposit by the time delta and subtract the remainder from the initial number, ending up streaming a value that is very, very close to the fixed deposit
  const vesting = await ethers.getContract("SafeVesting")
  const stream = await (await vesting.connect(await getNamedSigner("dev")).createStream(
    recipient,
    token,
    amount,
    timelength,
    { gasPrice: 1050000000, gasLimit: 5198000 }
  )).wait();
  console.log('stream created', stream.transactionHash);
  console.log('stream id', stream.events[stream.events.length - 1].topics[1]);
});

task("vesting:balance", "Check balance of stream on account")
.addParam("stream", "Stream id")
.addParam("account", "Balance to check")
.setAction(async function ({
  stream,
  account,
}, { ethers: { getNamedSigner } }, runSuper) {
  const sablier = new ethers.Contract(
    // TODO make this SABLIER_ADDRESS
    "0xeE85373F26E5380Fbd71FB7295BD68fdd0818887",
     require('../abi/ISablier.json')
  );
  console.log('balance', ethers.utils.formatEther(await (await sablier.connect(await getNamedSigner("dev")).balanceOf(
    stream,
    account,
  ))));
});

task("vesting:withdraw", "Withdraw balance")
.addParam("stream", "Stream id")
.setAction(async function ({
  stream,
}, { ethers: { getNamedSigner } }, runSuper) {
  const sablier = new ethers.Contract(
    // TODO make this SABLIER_ADDRESS
    "0xeE85373F26E5380Fbd71FB7295BD68fdd0818887",
     require('../abi/ISablier.json')
  );
  const balance = (await (await sablier.connect(await getNamedSigner("dev")).balanceOf(
    stream,
    await (await getNamedSigner("vesting")).getAddress(),
  ))).toString();
  console.log('balance', balance);
  const withdraw = await (await sablier.connect(await getNamedSigner("vesting")).withdrawFromStream(
    stream,
    balance,
    { gasPrice: 1050000000, gasLimit: 5198000 }
  )).wait();
  console.log('withdraw', withdraw.transactionHash);
});
