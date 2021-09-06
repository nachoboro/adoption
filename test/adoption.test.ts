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
  describe("sendPetToBeAdopted", async () => {
    it("First pet creation", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(await adoptionContract.pets(0)).to.eq("FirstPet");
      expect(await adoptionContract.petToAdopter("FirstPet")).to.eq("0x959FD7Ef9089B7142B6B908Dc3A8af7Aa8ff0FA1");
    });
  });
});
