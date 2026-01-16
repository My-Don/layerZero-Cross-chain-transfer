// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
//import "@nomicfoundation/hardhat-verify"
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

import './type-extensions'
import './tasks/sendOFT'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'arbitrum-sepolia': {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: process.env.RPC_URL_ARB_SEPOLIA || 'https://arbitrum-sepolia.gateway.tenderly.co',
            accounts,
            oftAdapter: {
                tokenAddress: '0x87ef6FAe84C6322b907D3F07754276dDED94C501', // usdt合约地址
            },
        },
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.RPC_URL_BASE_SEPOLIA || 'https://base-sepolia.gateway.tenderly.co',
            accounts,
            oftAdapter: {
                tokenAddress: '0x35430d5DE783051f6aa2c2AD27F4D1e13aaABa2D', // Set the token address for the OFT adapter
            },
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
    // etherscan: {
    //     enabled: true,
    //     // 使用新的 v2 API 配置
    //     apiKey: {
    //     arbitrumSepolia: "AXP9QMUT37VG57HNKP67QIRIRMP75SM6IT",
    //     baseSepolia: "AXP9QMUT37VG57HNKP67QIRIRMP75SM6IT"
    //     },
    //     customChains: [
    //     {
    //         network: "arbitrumSepolia",
    //         chainId: 421614,
    //         urls: {
    //         apiURL: "https://api.etherscan.io/v2/api?chainid=421614",
    //         browserURL: "https://sepolia.arbiscan.io/"
    //         }
    //     },
    //     {
    //         network: "baseSepolia",
    //         chainId: 84532,
    //         urls: {
    //         apiURL: "https://api.etherscan.io/v2/api?chainid=84532",
    //         browserURL: "https://sepolia.basescan.org/"
    //         }
    //     }
    //     ]
    // }
}

export default config
