import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'USDT'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)


    const initialMintAmount = hre.ethers.utils.parseEther('40000') // 10 tokens

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)


    // Mint initial tokens to the deployer
    const [signer] = await hre.ethers.getSigners()
    const innerToken = await hre.ethers.getContractAt(contractName, address, signer)

    const mintTx = await innerToken.mint(initialMintAmount)
    await mintTx.wait()

    const balance = await innerToken.balanceOf(deployer)
    console.log(`Minted ${hre.ethers.utils.formatEther(balance)} tokens to deployer: ${deployer}`)
}

deploy.tags = [contractName]

export default deploy
