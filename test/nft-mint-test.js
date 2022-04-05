const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Minting", function () {
    it("Should retrieve correct baseURI for inital tokens", async function () {

        const signers = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFT");
        const tokenContract = await NFT.deploy("Shyro Airdrop", "SHYAIR", "https://ipn/jink/");
        await tokenContract.deployed();

        expect(await tokenContract.maxSupply()).to.equal(1000);

        const mintTx = await tokenContract.mint(signers[0].address, 10);

        // wait until the transaction is mined
        await mintTx.wait();

        expect(await tokenContract.tokenURI(5)).to.equal("https://ipn/jink/5.json");
    });

    it("Should not be able to mint more than maxSupply tokens", async function () {

        const signers = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFT");
        const tokenContract = await NFT.deploy("Shyro Airdrop", "SHYAIR", "https://ipn/jink/");
        await tokenContract.deployed();

        expect(await tokenContract.maxSupply()).to.equal(1000);

        //reset our max supply
        const maxTx = await tokenContract.setmaxSupply(10);
        await maxTx.wait();

        //reset our baseURI for the first tokens 
        const baseTx = await tokenContract.setBaseURI(0, 10, "https://ipn/jink/");
        await baseTx.wait();

        try {
            const mintTx = await tokenContract.mint(signers[0].address, 11);
            // wait until the transaction is mined
            await mintTx.wait();
        } catch (err) {
            expect(err.message).to.include('Transaction reverted');
        }

    });

    it("Should be able to increase max supply and mint additional NFTs with new baseURI", async function () {

        const signers = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFT");
        const tokenContract = await NFT.deploy("Shyro Airdrop", "SHYAIR", "https://ipn/jink/");
        await tokenContract.deployed();

        expect(await tokenContract.maxSupply()).to.equal(1000);

        //reset our max supply
        const maxTx = await tokenContract.setmaxSupply(10);
        await maxTx.wait();

        //reset our baseURI for the first tokens 
        const baseTx = await tokenContract.setBaseURI(0, 10, "https://ipn/jink/");
        await baseTx.wait();

        const mintTx = await tokenContract.mint(signers[0].address, 10);
        await mintTx.wait();
        expect(await tokenContract.tokenURI(5)).to.equal("https://ipn/jink/5.json");

        //increase our max supply
        const max2Tx = await tokenContract.setmaxSupply(20);
        await max2Tx.wait();

        //add new baseURI for the second set of tokens
        const base2Tx = await tokenContract.setBaseURI(11, 30, "https://ipn/set2/");
        await base2Tx.wait();

        const mint2Tx = await tokenContract.mint(signers[0].address, 10);
        await mint2Tx.wait();
        expect(await tokenContract.tokenURI(15)).to.equal("https://ipn/set2/15.json");


    });

});
