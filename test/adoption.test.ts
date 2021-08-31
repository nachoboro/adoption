import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Adoption__factory } from "../typechain";
import { addListener } from "process";

chai.use(solidity);
const { expect } = chai;

describe("Adoption", () => {
  let adoptionAddress: string;
  let adoptionContract: any;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const adoptionFactory = new Adoption__factory(deployer);
    adoptionContract = await adoptionFactory.deploy();
    adoptionAddress = adoptionContract.address;
  });
  describe("Delete me", async () => {
    it("Delete me should start as 1", async () => {
      const deleteMe = await adoptionContract.deleteMe();
      expect(deleteMe).to.eq(1);
    });
    it("After set delete me, the variable should be +5 the setted value", async () => {
      await adoptionContract.setDeleteMe(3);
      expect(await adoptionContract.deleteMe()).to.eq(8);
    });
  });
});
