const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  const taxFee = 5
  
  const [deployer] = await ethers.getSigners()

  const NTPUFundContract = await ethers.getContractFactory("NTPUFund") // 抓取我們寫的合约
  const ntpuFund_contract = await NTPUFundContract.connect(deployer).deploy(taxFee, 2) // 部署合约，而我的合約需要傳一個稅率參數進去, 第二個參數是分期付款的期數

  await ntpuFund_contract.deployed()

  // 把合约地址寫進一個json檔案
  const ntpuFund_address = JSON.stringify({ address: ntpuFund_contract.address }, null, 4) 
  fs.writeFile('./src/abis/NTPUFundContractAddress.json', ntpuFund_address, 'utf8', (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Deployed NTPUFund contract address', ntpuFund_contract.address)
    console.log('NTPUFund Contract owner is:', deployer.address)
  })

  const NTPUVoteContract = await ethers.getContractFactory("NTPUVote")
  const ntpuVote_contract = await NTPUVoteContract.connect(deployer).deploy(ntpuFund_contract.address)

  await ntpuVote_contract.deployed()

  const ntpuVote_address = JSON.stringify({ address: ntpuVote_contract.address }, null, 4)
  fs.writeFile('./src/abis/NTPUVoteContractAddress.json', ntpuVote_address, 'utf8', (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Deployed NTPUVote contract address', ntpuVote_contract.address)
    console.log('NTPUVote Contract owner is:', deployer.address)
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
