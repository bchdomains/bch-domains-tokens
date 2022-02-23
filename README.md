# BCH Domain Auxillary Contracts

https://mistswap.fi

## Deployed Contracts

https://github.com/mistswapdex/mistswap-sdk/blob/master/src/constants/addresses.ts

## Docs

[Development](docs/DEVELOPMENT.md)

[Deployment](docs/DEPLOYMENT.md)

## Security

[Security Policy](SECURITY.md)

## License

[MIT](LICENSE.txt)

### setup

```
yarn smartbch-amber:deploy
npx hardhat --network smartbch-amber erc20:transfer --recipient "MISTBARCONVERTER" --token "DOMAINTOKEN" --amount "350000000000000000000000"
npx hardhat --network smartbch-amber erc20:transfer --recipient "SAFEVESTING" --token "DOMAINTOKEN" --amount "500000000000000000000000"

# set up mist staking
npx hardhat --network smartbch-amber converter:stake

# set up vesting
# update recipient addresses for mistswap and pat
# python: ((250000 * 10 ** 18) // (365 * 24 * 60 * 60)) * (365 * 24 * 60 * 60) 
npx hardhat --network smartbch-amber vesting:create --recipient "MISTSWAP_ADDRESS" --token "DOMAINTOKEN" --amount "249999999999999980256000" --timelength "31536000"
npx hardhat --network smartbch-amber vesting:create --recipient "PAT_ADDRESS" --token "DOMAINTOKEN" --amount "249999999999999980256000" --timelength "31536000"

# distribute to private sale
npx hardhat --network smartbch-amber erc20:transfer --recipient "PRIVATE_SALE" --token "DOMAINTOKEN" --amount "50000000000000000000000"

# distribute to xmist holders
npx hardhat --network smartbch-amber snapshot
# take above and send

# set up lp
npx hardhat --network smartbch-amber erc20:transfer --recipient "PRIVATE_SALE_FOR_LP" --token "DOMAINTOKEN" --amount "25000000000000000000000"
npx hardhat --network smartbch-amber erc20:transfer --recipient "LP_WALLET" --token "DOMAINTOKEN" --amount "25000000000000000000000"
# go onto app.mistswap.fi and set up lp using LP_WALLET (test with 1 token first) and do remaining test steps, then add rest to liquidity

# test setup correct (using 1 token)
npx hardhat --network smartbch-amber erc20:transfer --recipient "DOMAINBAR" --token "DOMAINTOKEN" --amount "1000000000000000000"
npx hardhat --network smartbch-amber erc20:transfer --recipient "MISTBARCONVERTER" --token "DOMAINTOKEN" --amount "1000000000000000000"
npx hardhat --network smartbch-amber converter:stake
npx hardhat --network smartbch-amber converter:convert

# testing receiver
# transfer ownership of ETHRegistrarController to ENSBCHReceiver (different repo)
npx hardhat --network smartbch-amber receiver:convert

```
