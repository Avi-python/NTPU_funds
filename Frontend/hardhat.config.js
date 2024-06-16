require('@nomiclabs/hardhat-waffle')
require('dotenv').config()

// 31337

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: process.env.BLOCKCHAIN_URL,
      accounts: ["0x" + process.env.APP_OWNER_PRIVATE_KEY]
    },
  },
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './src/contracts',
    artifacts: './src/abis',
  },
  mocha: {
    timeout: 40000,
  },
}
