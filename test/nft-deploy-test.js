const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Deploy", function () {
  it("Should deploy with baseURI", async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const tokenContract = await NFT.deploy("Shyro Airdrop", "SHYAIR", "https://ipn/1");
    await tokenContract.deployed();

    expect(await tokenContract.maxSupply()).to.equal(1000);
  });
});
