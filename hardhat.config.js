const { init } = require("fp-ts/lib/Array");
const { initial } = require("lodash");

require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
//require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

//const Private_Key = "ee91f26be937822b73a2cab041e1bf65d986b6639319ddb297a9a0cb61360c03"
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.5",
  networks: {
    hardhat:{
      forking: {url: process.env.ROPSTEN_URL || "https://ropsten.infura.io/v3/086b2f5436fe40c8ac6aefbc93f206cd"},
      allowUnlimitedContractSize: true
    },

    ropsten: {
      url: process.env.ROPSTEN_URL || "https://ropsten.infura.io/v3/086b2f5436fe40c8ac6aefbc93f206cd",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [process.env.PRIVATE_KEY0,process.env.PRIVATE_KEY1,process.env.PRIVATE_KEY2,process.env.PRIVATE_KEY3,process.env.PRIVATE_KEY4,process.env.PRIVATE_KEY5],
      //accounts: [`0x${Private_Key}`]
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      //   path:"m/44'/60'/0'/0",
      //   initialIndex:0,
      //   count:5,
      //   passPhrase:''
      // }
     gas:5603244

    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    reporter: 'xunit',
    reporterOptions: {
      output: 'GIVERS_TEST-results.xml'
    }
  }
};
