from django.conf import settings
from web3 import Web3, HTTPProvider
from eth_account.messages import encode_defunct
import json

w3 = Web3(HTTPProvider(settings.BLOCKCHAIN_URL)) # 連接到blockchain
contract_address = None
contract_abi = None
contract = None

try:
    with open('../../frontend/src/abis/contractAddress.json') as json_file:
        contract_address = json.load(json_file)["address"]
    with open("../../frontend/src/abis/src/contracts/Genesis.sol/Genesis.json") as abi_file:
        contract_abi = json.load(abi_file)["abi"]
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
except Exception as e:
    raise e

# 現在你可以讀取合約的狀態

def get_address(messageHash, signature):
    # print('w3.eth.accounts', w3.eth.accounts)
    result = w3.eth.account.recover_message(encode_defunct(text=messageHash), signature=signature)
    print("result:", result)
    return result

# def is_project_follower():
#     return contract.functions.creator().call()
