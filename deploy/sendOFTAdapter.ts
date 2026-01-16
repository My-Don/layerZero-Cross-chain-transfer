// import { ethers } from "hardhat";
// import { Options } from "@layerzerolabs/lz-v2-utilities";

// const ADAPTER = "0x691976771B5cb38ea0aabDb5CdB02a20916B6114"; // Arb Sepolia的
// const DST_EID = 40245; // Base Sepolia
// const TO = "0x5159eA8501d3746bB07c20B5D0406bD12844D7ec";
// const AMOUNT = ethers.utils.parseUnits("10", 18);


// async function main() {
//   const [signer] = await ethers.getSigners();

//   const adapter = await ethers.getContractAt(
//     "MyUSDTMintBurnOFTAdapter",
//     ADAPTER,
//     signer
//   );

//   const options = Options
//     .newOptions()
//     .addExecutorLzReceiveOption(2_000_000, 0)
//     .toHex();

//   const params = {
//     dstEid: DST_EID,
//     to: ethers.utils.hexZeroPad(TO, 32),
//     amountLD: AMOUNT,
//     minAmountLD: AMOUNT,
//     extraOptions: options,
//     composeMsg: "0x",
//     oftCmd: "0x",
//   };

//   const quote = await adapter.quoteSend(params, false);

//   console.log("nativeFee:", quote.nativeFee.toString());

//   const tx = await adapter.send(
//     params,
//     quote,
//     signer.address,
//     { value: quote.nativeFee }
//   );

//   console.log("tx hash:", tx.hash);
//   await tx.wait();
//   console.log("send success");
// }

// main().catch(console.error);
