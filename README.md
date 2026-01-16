<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="width: 400px" src="https://docs.layerzero.network/img/LayerZero_Logo_Black.svg"/>
  </a>
</p>

<p align="center">
 <a href="https://docs.layerzero.network/" style="color: #a77dff">LayerZero Docs</a>
</p>

<h1 align="center">OFT Adapter Example</h1>

<p align="center">Template project for converting an existing token into a cross-chain token (<a href="https://docs.layerzero.network/v2/concepts/applications/oft-standard">OFT</a>) using the LayerZero protocol. This example's config involves EVM chains, but the same OFT can be extended to involve other VM chains such as Solana, Aptos and Hyperliquid.</p>

## Table of Contents

- [Prerequisite Knowledge](#prerequisite-knowledge)
- [Introduction](#introduction)
- [Requirements](#requirements)
- [Scaffold this example](#scaffold-this-example)
- [Helper Tasks](#helper-tasks)
- [Setup](#setup)
- [Build](#build)
  - [Compiling your contracts](#compiling-your-contracts)
- [Deploy](#deploy)
- [Enable Messaging](#enable-messaging)
- [Sending OFTs](#sending-ofts)
- [Next Steps](#next-steps)
- [Production Deployment Checklist](#production-deployment-checklist)
  - [Profiling `lzReceive` and `lzCompose` Gas Usage](#profiling-lzreceive-and-lzcompose-gas-usage)
  - [Available Commands](#available-commands)
    - [`lzReceive`](#lzreceive)
    - [`lzCompose`](#lzcompose)
  - [Usage Examples](#usage-examples)
  - [Notes](#notes)
- [Appendix](#appendix)
  - [Running Tests](#running-tests)
  - [Adding other chains](#adding-other-chains)
  - [Using Multisigs](#using-multisigs)
  - [LayerZero Hardhat Helper Tasks](#layerzero-hardhat-helper-tasks)
  - [Manual Configuration](#manual-configuration)
  - [Contract Verification](#contract-verification)
  - [Troubleshooting](#troubleshooting)

## Prerequisite Knowledge

- [What is an OFT (Omnichain Fungible Token) ?](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
- [What is an OApp (Omnichain Application) ?](https://docs.layerzero.network/v2/concepts/applications/oapp-standard)

## Introduction

**OFT Adapter** - while a regular OFT uses the mint/burn mechanism, an OFT adapter uses lock/unlock. The OFT Adapter contract functions as a lockbox for the existing token (referred to as the _inner token_). Given the inner token's chain, transfers to outside the inner token's chain will require locking and transfers to the inner token's chain will result in unlocking.

<!-- TODO: remove this Introduction after having a page/section specifically on OFT Adapter that we can link to under Prerequisite Knowledge -->

## Requirements

- `Node.js` - ` >=18.16.0`
- `pnpm` (recommended) - or another package manager of your choice (npm, yarn)
- `forge` (optional) - `>=0.2.0` for testing, and if not using Hardhat for compilation

在目录下，git bash执行下列操作
```sh
用 LayerZero CLI 工具部署合约
npx hardhat lz:deploy
选2个网络,再输入USDT，回车即可,终端打印如下
info:    Compiling your hardhat project
Nothing to compile
√ Which networks would you like to deploy? » arbitrum-sepolia, base-sepolia
√ Which deploy script tags would you like to use? ... USDT
info:    Will deploy 2 networks: arbitrum-sepolia, base-sepolia
info:    Will use deploy scripts tagged with USDT
√ Do you want to continue? ... yes
Network: arbitrum-sepolia
Deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
Network: base-sepolia
Deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
Deployed contract: USDT, network: base-sepolia, address: 0x35430d5DE783051f6aa2c2AD27F4D1e13aaABa2D
Deployed contract: USDT, network: arbitrum-sepolia, address: 0x87ef6FAe84C6322b907D3F07754276dDED94C501
Minted 30040000.0 tokens to deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
Minted 30040000.0 tokens to deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
info:    ✓ Your contracts are now deployed


cd ..
修改hardhat.config.ts
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
        }
保存文件
pnpm install
pnpm compile
npx hardhat lz:deploy --network arbitrum-sepolia
选择arb-sepolia,base-sepolia,再输入MyUSDTMintBurnOFTAdapter,回车即可
终端打印如下:
info:    Compiling your hardhat project
Nothing to compile
√ Which networks would you like to deploy? » arbitrum-sepolia, base-sepolia
√ Which deploy script tags would you like to use? ... MyUSDTMintBurnOFTAdapter
info:    Will deploy 2 networks: arbitrum-sepolia, base-sepolia
info:    Will use deploy scripts tagged with MyUSDTMintBurnOFTAdapter
√ Do you want to continue? ... yes
Network: base-sepolia
Deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
Network: arbitrum-sepolia
Deployer: 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec
Deployed contract: MyUSDTMintBurnOFTAdapter, network: arbitrum-sepolia, address: 0x044Ed509FfD11ff8B5eA85a1D2d8ea5C0652CCc6
Deployed contract: MyUSDTMintBurnOFTAdapter, network: base-sepolia, address: 0xF70e01f57A76674728b9986f688A3327c943A88e
info:    ✓ Your contracts are now deployed

下一步
arbitrum-sepolia网络,通过usdt合约调用transferOwnership，参数是MyUSDTMintBurnOFTAdapter的合约地址即0x044Ed509FfD11ff8B5eA85a1D2d8ea5C0652CCc6
base-sepolia网络,通过usdt合约调用transferOwnership，参数是MyUSDTMintBurnOFTAdapter合约地址0xF70e01f57A76674728b9986f688A3327c943A88e

下一步骤,验证 wiring 是否成功
修改layerzero.config.ts
const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'MyUSDTOFTAdapter',
}

const arbitrumContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyUSDTOFTAdapter',
}
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
终端打印数据如下


   │       ▓▓▓ LayerZero DevTools ▓▓▓        │
    │  ═══════════════════════════════════    │
    │          /*\                            │
    │         /* *\     BUILD ANYTHING        │
    │         ('v')                           │
    │        //-=-\\    ▶ OMNICHAIN           │
    │        (\_=_/)                          │
    │         ^^ ^^                           │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
    ╰─────────────────────────────────────────╯

info:    [OApp] Checking OApp configuration
info:    [OApp] Checking OApp peers configuration
info:    [OApp] ✓ Checked OApp peers configuration
info:    [OApp] Checking send libraries configuration
info:    [OApp] ✓ Checked send libraries configuration
info:    [OApp] Checking receive libraries configuration
info:    [OApp] ✓ Checked receive libraries configuration
info:    [OApp] Checking receive library timeout configuration
info:    [OApp] ✓ Checked receive library timeout configuration
info:    [OApp] Checking send configuration
info:    [OApp] ✓ Checked send configuration
info:    [OApp] Checking receive configuration
info:    [OApp] ✓ Checked receive configuration
info:    [OApp] Checking enforced options
info:    [OApp] ✓ Checked enforced options
info:    [OApp] Checking OApp callerBpsCap configuration
info:    [OApp] ✓ Checked OApp callerBpsCap configuration
info:    [OApp] Checking OApp delegates configuration
info:    [OApp] ✓ Checked OApp delegates
info:    [OApp] ✓ Checked OApp configuration
info:    There are 12 transactions required to configure the OApp
√ Would you like to preview the transactions before continuing? ... no
√ Would you like to submit the required transactions? ... yes
info:    Successfully sent 12 transactions
info:    ✓ Your OApp is now configured

检查 wiring 配置
npx hardhat lz:oapp:config:get --oapp-config layerzero.config.ts
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
ps：这2个命令会打印很多东西就不展示了

下一步跨链转账测试
命令如下:
npx hardhat lz:oft:send \
  --src-eid 40231 \
  --dst-eid 40245 \
  --amount 10 \
  --to 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec \
  --oapp-config layerzero.config.ts
这是终端打印的数据，如下:
info:    Quoting the native gas cost for the send transaction...
info:    Sending the transaction...
info:     Successfully sent 10 tokens from arbsep-testnet to basesep-testnet
info:     Explorer link for source chain arbsep-testnet: https://sepolia.arbiscan.io/tx/0x21713e48351591816e7534f9cd1651c1fd2d8b38ebba3df2e874177343b73b1d
info:     LayerZero Scan link for tracking all cross-chain transaction details: https://testnet.layerzeroscan.com/tx/0x21713e48351591816e7534f9cd1651c1fd2d8b38ebba3df2e874177343b73b1d

```
