import { ethers } from "hardhat";
import chai, { Assertion } from "chai";
import { solidity } from "ethereum-waffle";
import { Adoption__factory } from "../typechain";
import { addListener } from "process";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity);
const { expect } = chai;


describe("Adoption", () => {
  let adoptionAddress: string;
  let adoptionContract: any;
  let contractDeployer: SignerWithAddress;
  let testSender: SignerWithAddress;

  beforeEach(async () => {
    const [deployer, sender] = await ethers.getSigners();
    const adoptionFactory = new Adoption__factory(deployer);
    adoptionContract = await adoptionFactory.deploy();
    adoptionAddress = adoptionContract.address;
    // default sender
    contractDeployer = deployer;
    // another sender
    testSender = sender;
  });

  describe("sendPetToBeAdopted test", async () => {
    it("Pet creation", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(await adoptionContract.pets(0)).to.eq("FirstPet");
      expect(await adoptionContract.petToAdopter("FirstPet")).to.eq(contractDeployer.address);
    });
    it("Pet already created", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // check an easy way to do this
      try {
        await adoptionContract.sendPetToBeAdopted("FirstPet");
      }
      catch (e) {
        expect(e.message).to.eq("VM Exception while processing transaction: revert Pet already created.")
      }
    });
  });

  describe("getPetOwner test", async () => {
    it("Get pet owner address", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(await adoptionContract.getPetOwner("FirstPet")).to.eq(contractDeployer.address);
    });
  });

  describe("adoptAPet test", async () => {
    it("Pet adoption", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // change sender
      await adoptionContract.connect(testSender).adoptAPet("FirstPet");
      expect(await adoptionContract.petToAdopter("FirstPet")).to.eq(testSender.address);
    });
    it("Failed pet adoption by current owner", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // check an easy way to do this
      try {
        await adoptionContract.adoptAPet("FirstPet");
      }
      catch (e) {
        expect(e.message).to.eq("VM Exception while processing transaction: revert Pet cannot be adopted by the current owner.")
      }
    });
  });

  describe("getPetOwners test", async () => {
    it("Get pets and owners", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // change sender
      await adoptionContract.connect(testSender).sendPetToBeAdopted("SecondPet");
      const [pets, owners] = await adoptionContract.getPetOwners();
      expect(pets).to.eql(["FirstPet", "SecondPet"]);
      expect(owners).to.eql([contractDeployer.address, testSender.address]);
    });
  });

  describe("donate test", async () => {
    it("Pet adoption", async () => {
      await adoptionContract.donate({
        value: ethers.utils.parseEther('0.1')
      });
      // check contract address balance
      const val = await ethers.provider.getBalance(adoptionAddress);
      expect(val).to.eq(ethers.utils.parseEther('0.1'));
    });
  });

  describe("claimAward test", async () => {
    beforeEach(async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // change sender
      await adoptionContract.connect(testSender).adoptAPet("FirstPet");
    });
    it("Claim award by pet", async () => {
      await adoptionContract.donate({
        value: ethers.utils.parseEther('0.1')
      });
      await adoptionContract.connect(testSender).claimAward();
      const remain = await ethers.provider.getBalance(adoptionAddress);
      expect(remain).to.eq(ethers.utils.parseEther('0.09'));
    });
    it("Claim from owner but not adopter", async () => {
      await adoptionContract.donate({
        value: ethers.utils.parseEther('0.1')
      });
      // check an easy way to do this
      try {
        await adoptionContract.claimAward();
      }
      catch (e) {
        expect(e.message).to.eq("VM Exception while processing transaction: revert Only an adopter can claim his award and can only claim it once per adopted pet.")
      }
    });
    it("Contract without funds", async () => {
      // check an easy way to do this
      try {
        await adoptionContract.connect(testSender).claimAward();
      }
      catch (e) {
        expect(e.code).to.eq("INSUFFICIENT_FUNDS")
      }
    });
  });

});
