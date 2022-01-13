import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Adoption__factory } from "../typechain";
import { addListener } from "process";
import { messagePrefix } from "@ethersproject/hash";
import { BigNumber, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";

chai.use(solidity);
const { expect } = chai;

describe("Adoption", () => {
  let adoptionAddress: string;
  let adoptionContract: any;
  let address1: Signer;
  let address2: Signer;

  beforeEach(async () => {
    const [deployer, address3, address4] = await ethers.getSigners();
    address1 = address3;
    address2 = address4;
    const adoptionFactory = new Adoption__factory(deployer);
    adoptionContract = await adoptionFactory.deploy();
    adoptionAddress = adoptionContract.address;
  });
  describe("Send pet to be adopted", async () => {
    it("After sending pet to be adopted then array size should be increased", async () => {
      await adoptionContract.connect(address1).sendPetToBeAdopted("Chami");
      expect(await adoptionContract.getPetOwner("Chami")).to.be.eq(await address1.getAddress());
    });  
  });
  describe("Get pet owner", async () => {
    it("When getting pet owner then right owner should be returned", async () => {
      await adoptionContract.connect(address1).adoptAPet("Chami");
      expect(await adoptionContract.getPetOwner("Chami")).to.be.eq(await address1.getAddress());
    });
  });
  describe("Adopt a pet", async () => {
    it("After adopting a pet then owner should change", async () => {
      let owner = await adoptionContract.getPetOwner("Chami");
      await adoptionContract.adoptAPet("Chami");
      expect(await adoptionContract.getPetOwner("Chami")).to.be.not.eq(owner);
    });
    it("When adopting a pet you already own then error message should be sent",async () => {
      await adoptionContract.adoptAPet("Chami");
      await expect(adoptionContract.adoptAPet("Chami")).to.be.revertedWith("Cannot adopt a pet you already Own");
    });
  });
  describe("Get pet owners", async () => {
    it("When getting pet owners then correct mapping should be returned", async () => {
      await adoptionContract.connect(address1).sendPetToBeAdopted("Chami");
      let map = await adoptionContract.getPetOwners();
      expect(map[0][0]).to.be.eq("Chami");
      expect(map[1][0]).to.be.eq(await address1.getAddress());
    });
  });
  describe("Donate", async () => {
    it("When donating then available money should increase", async () => {
      await adoptionContract.donate({value: ethers.utils.parseEther('0.5')});
      expect(await adoptionContract.getAvailableMoney()).to.be.eq(ethers.utils.parseEther('0.5'));
    });
  });
  describe("Claim awards",async () => {
    it("When claiming with a non owner then error message should be sent", async () => {
      await adoptionContract.connect(address1).adoptAPet("Chami");
      await expect(adoptionContract.connect(address2).claimAward()).to.be.revertedWith("Only owners can claim awards");
    });
    it("When claiming with an owner with balance left then all balances should be correctly adjusted", async () => {
      await adoptionContract.connect(address1).adoptAPet("Chami");
      await adoptionContract.connect(address1).adoptAPet("Boro");
      await adoptionContract.connect(address1).adoptAPet("Goldfryd");
      await adoptionContract.donate({value: ethers.utils.parseEther('0.35')});
      await adoptionContract.connect(address1).claimAward();
      expect(await adoptionContract.getAvailableMoney()).to.be.eq(ethers.utils.parseEther('0.05'));
    });
    it("When claiming with an owner with no balance then error message should be sent", async () => {
      await adoptionContract.connect(address1).adoptAPet("Chami");
      await adoptionContract.donate({value: ethers.utils.parseEther('0.1')});
      await adoptionContract.connect(address1).claimAward();
      await expect(adoptionContract.connect(address1).claimAward()).to.be.revertedWith("No Balance left to claim");
    });
    it("When claiming with insufficient amount of donations then error message should be sent", async () => {
      await adoptionContract.connect(address1).adoptAPet("Chami");
      await expect(adoptionContract.connect(address1).claimAward()).to.be.revertedWith("Insufficient money to claim balance");
    });
  });
});

