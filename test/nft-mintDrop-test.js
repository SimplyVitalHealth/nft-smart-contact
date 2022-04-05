const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Minting", function () {
    it("Should be able to mintdrop to an address list", async function () {

        const signers = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFT");
        const tokenContract = await NFT.deploy("Shyro Airdrop", "SHYAIR", "https://ipn/jink/");
        await tokenContract.deployed();

        expect(await tokenContract.maxSupply()).to.equal(1000);

        const mintDropTx = await tokenContract.mintDrop([signers[1].address, signers[2].address]);
        await mintDropTx.wait();

        expect(await tokenContract.walletOfOwner(signers[1].address)).to.deep.include(ethers.BigNumber.from("1"));
        expect(await tokenContract.walletOfOwner(signers[2].address)).to.deep.include(ethers.BigNumber.from("2"));        
        
    });

});
