const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  const taxFee = 5
  const Contract = await ethers.getContractFactory("Genesis") // 抓取我們寫的合约
  const contract = await Contract.deploy(taxFee) // 部署合约，而我的合約需要傳一個稅率參數進去

  await contract.deployed()

  // 把合约地址寫進一個json檔案
  const address = JSON.stringify({ address: contract.address }, null, 4) 
  fs.writeFile('./src/abis/contractAddress.json', address, 'utf8', (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Deployed contract address', contract.address)
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
