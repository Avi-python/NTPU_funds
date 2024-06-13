from django.conf import settings
from web3 import Web3, HTTPProvider
from eth_account.messages import encode_defunct
from django.conf import settings

import json


w3 = Web3(HTTPProvider(settings.BLOCKCHAIN_URL)) # 連接到blockchain
contract_address = None
contract_abi = None
contract = None
account = settings.ACCOUNT

try:
    with open('../../frontend/src/abis/NTPUFundContractAddress.json') as json_file:
        contract_address = json.load(json_file)["address"]
    with open("../../frontend/src/abis/src/contracts/NTPUFund.sol/NTPUFund.json") as abi_file:
        contract_abi = json.load(abi_file)["abi"]
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
except Exception as e:
    raise e

# 現在你可以讀取合約的狀態

def getAddress(messageHash, signature):
    # print('w3.eth.accounts', w3.eth.accounts)
    result = w3.eth.account.recover_message(encode_defunct(text=messageHash), signature=signature)
    print("result:", result)
    return result

def addCreator(address):
    print('owner account:', account)
    print('new creator address:', address)
    tx_hash = contract.functions.addCreator(address).transact({'from': account})
    print("addCreator tx_hash : ", tx_hash)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash) # 等待交易完成
    return receipt


def isAppOwner(address):
    return contract.functions.isAppOwner(address).call()

def isProjectCreator(projectId, address):
    return contract.functions.isProjectCreator(projectId, address).call()

def isProjectFollower(projectId, address):
    result = contract.functions.getBackers(projectId).call()

    for unit in result:
        if unit[0] == address:
            return True

    return False
