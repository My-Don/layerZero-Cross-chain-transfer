<p align="center">
  <a href="https://layerzero.network">
    <img alt="LayerZero" style="width: 400px" src="https://docs.layerzero.network/img/LayerZero_Logo_Black.svg" />
  </a>
</p>

<p align="center">
  <a href="https://docs.layerzero.network/" style="color: #a77dff">LayerZero Docs</a>
</p>

---

# LayerZero OFT Adapter Demo（GitHub README）

基于 **LayerZero v2** 的 **OFT Adapter（Lock / Unlock）** 示例，演示如何在 **Arbitrum Sepolia ↔ Base Sepolia** 之间部署 USDT 并完成跨链转账测试。

---

## 📚 前置知识

* [什么是 OFT（Omnichain Fungible Token）？](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
* [什么是 OApp（Omnichain Application）？](https://docs.layerzero.network/v2/concepts/applications/oapp-standard)

---

## 📖 简介

**OFT Adapter** 在本示例中采用 **Burn / Mint** 机制（而非 Lock / Unlock）：

* 源链（Source Chain）：**销毁（Burn）Token**
* 目标链（Destination Chain）：**铸造（Mint）Token**

也就是说，每次跨链转账都会在源链减少 Token 总量，在目标链生成等量 Token，从而保持全链供应一致。

> ⚠️ 注意：虽然 OFT Adapter 也可以用于 Lock / Unlock 场景，但**本文档演示的是 Mint / Burn 情形**。

---

## ✅ 环境要求

* **Node.js** `>= 18.16.0`
* **pnpm**（推荐，也可使用 npm / yarn）
* **Hardhat**
* **forge**（可选，用于测试） `>= 0.2.0`

---

## 🚀 快速开始

### 1️⃣ 安装依赖并编译

在项目目录下使用 **Git Bash / 终端**：

```bash
pnpm install
pnpm compile
```

---

### 2️⃣ 部署 USDT 合约（两条测试网）

```bash
npx hardhat lz:deploy
```

交互式选择：

* Networks：`arbitrum-sepolia`, `base-sepolia`
* Deploy tag：`USDT`

成功示例输出（节选）：

```text
Deployed contract: USDT, network: base-sepolia, address: 0x35430d5DE783051f6aa2c2AD27F4D1e13aaABa2D
Deployed contract: USDT, network: arbitrum-sepolia, address: 0x87ef6FAe84C6322b907D3F07754276dDED94C501
Minted 30040000.0 tokens to deployer
✓ Your contracts are now deployed
```

---

## ⚙️ 配置 OFT Adapter

### 3️⃣ 修改 `hardhat.config.ts`

```ts
'arbitrum-sepolia': {
  eid: EndpointId.ARBSEP_V2_TESTNET,
  url: process.env.RPC_URL_ARB_SEPOLIA || 'https://arbitrum-sepolia.gateway.tenderly.co',
  accounts,
  oftAdapter: {
    tokenAddress: '0x87ef6FAe84C6322b907D3F07754276dDED94C501', // USDT (Arbitrum Sepolia)
  },
},
'base-sepolia': {
  eid: EndpointId.BASESEP_V2_TESTNET,
  url: process.env.RPC_URL_BASE_SEPOLIA || 'https://base-sepolia.gateway.tenderly.co',
  accounts,
  oftAdapter: {
    tokenAddress: '0x35430d5DE783051f6aa2c2AD27F4D1e13aaABa2D', // USDT (Base Sepolia)
  },
},
```

保存文件后继续。

---

### 4️⃣ 部署 OFT Adapter 合约

```bash
npx hardhat lz:deploy --network arbitrum-sepolia
```

交互式选择：

* Networks：`arbitrum-sepolia`, `base-sepolia`
* Deploy tag：`MyUSDTMintBurnOFTAdapter`

成功示例输出：

```text
Deployed contract: MyUSDTMintBurnOFTAdapter, network: arbitrum-sepolia, address: 0x044Ed509FfD11ff8B5eA85a1D2d8ea5C0652CCc6
Deployed contract: MyUSDTMintBurnOFTAdapter, network: base-sepolia, address: 0xF70e01f57A76674728b9986f688A3327c943A88e
✓ Your contracts are now deployed
```

---

## 🔐 转移 USDT 合约所有权

### 5️⃣ transferOwnership（非常关键）

#### Arbitrum Sepolia

* USDT 合约调用：`transferOwnership`
* 参数：

```
0x044Ed509FfD11ff8B5eA85a1D2d8ea5C0652CCc6
```

#### Base Sepolia

* USDT 合约调用：`transferOwnership`
* 参数：

```
0xF70e01f57A76674728b9986f688A3327c943A88e
```

> ✅ 该步骤确保 OFT Adapter 拥有 Token 的控制权

---

## 🔗 OApp Wiring 配置

### 6️⃣ 修改 `layerzero.config.ts`

```ts
const baseContract: OmniPointHardhat = {
  eid: EndpointId.BASESEP_V2_TESTNET,
  contractName: 'MyUSDTOFTAdapter',
}

const arbitrumContract: OmniPointHardhat = {
  eid: EndpointId.ARBSEP_V2_TESTNET,
  contractName: 'MyUSDTOFTAdapter',
}
```

---

### 7️⃣ 执行 Wiring

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

成功示例输出：

```text
✓ Checked OApp configuration
✓ Checked send/receive configuration
Successfully sent 12 transactions
✓ Your OApp is now configured
```

---

### 8️⃣ 校验 Wiring 状态

```bash
npx hardhat lz:oapp:config:get --oapp-config layerzero.config.ts
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

> ℹ️ 输出内容较多，属正常现象

---

## 🔄 跨链转账测试（OFT Send）

### 9️⃣ 执行跨链转账

```bash
npx hardhat lz:oft:send \
  --src-eid 40231 \
  --dst-eid 40245 \
  --amount 10 \
  --to 0x5159eA8501d3746bB07c20B5D0406bD12844D7ec \
  --oapp-config layerzero.config.ts
```

成功示例输出：

```text
Successfully sent 10 tokens from arbsep-testnet to basesep-testnet
Explorer: https://sepolia.arbiscan.io/tx/0x21713e48...
LayerZero Scan: https://testnet.layerzeroscan.com/tx/0x21713e48...
```

---

## 🎯 最终效果

* ✅ USDT 使用 **Burn / Mint** 方式跨链
* ✅ 源链销毁 Token，目标链铸造 Token
* ✅ Arbitrum Sepolia ↔ Base Sepolia 双向打通
* ✅ OFT Adapter & OApp Wiring 配置完成

---

## 📎 参考资料

* LayerZero Docs：[https://docs.layerzero.network/](https://docs.layerzero.network/)
* LayerZero OFT：[https://docs.layerzero.network/v2/concepts/applications/oft-standard](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
* LayerZero OApp：[https://docs.layerzero.network/v2/concepts/applications/oapp-standard](https://docs.layerzero.network/v2/concepts/applications/oapp-standard)

---

## 📄 License

MIT
