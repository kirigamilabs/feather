import boa
import os
from datetime import datetime
from eth_account import Account
from getpass import getpass

if __name__ == '__main__':
    #boa.fork("rpc_url")
    #boa.set_network_env("rpc_url")

    private_key = getpass("Enter private key: ")
    acct = Account.from_key(private_key)
    boa.env.eoa = acct.address
    #boa.env.add_account(acct)
    print("\nAddress:", acct.address)

    erc721_src = open("src/erc721_mock.vy").read()
    erc721 = boa.loads_partial(erc721_src)
    erc721_contract = erc721.deploy('TEST 721', 'ERC', 'base_uri_', 'name_eip712_', 'version_eip712_')
    print("\n Contract Address:", erc721_contract.address)
    print(erc721_contract.name())
    print(erc721_contract.symbol())
    print(erc721_contract.balanceOf(boa.env.eoa))
    erc721_contract._customMint(boa.env.eoa, 10)
    print(erc721_contract.balanceOf(boa.env.eoa))
    