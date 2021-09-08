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
  let testSender1: SignerWithAddress;

  beforeEach(async () => {
    const [deployer, sender1, sender2] = await ethers.getSigners();
    const adoptionFactory = new Adoption__factory(deployer);
    adoptionContract = await adoptionFactory.deploy();
    adoptionAddress = adoptionContract.address;
    // default sender
    contractDeployer = deployer;
    testSender1 = sender1;
  });

  describe("sendPetToBeAdopted test", async () => {
    it("Pet creation", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(await adoptionContract.pets(0)).to.eq("FirstPet");
      expect(await adoptionContract.petToAdopter("FirstPet")).to.eq(contractDeployer.address);
    });
    it("Pet already created", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(adoptionContract.sendPetToBeAdopted("FirstPet")).to.be.revertedWith(
        "Pet already created."
      );
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
      await adoptionContract.connect(testSender1).adoptAPet("FirstPet");
      expect(await adoptionContract.petToAdopter("FirstPet")).to.eq(testSender1.address);
    });
    it("Failed pet adoption by current owner", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      expect(adoptionContract.adoptAPet("FirstPet")).to.be.revertedWith(
        "Pet cannot be adopted by the current owner."
      );
    });
  });

  describe("getPetOwners test", async () => {
    it("Get pets and owners", async () => {
      await adoptionContract.sendPetToBeAdopted("FirstPet");
      // change sender
      await adoptionContract.connect(testSender1).sendPetToBeAdopted("SecondPet");
      const [pets, owners] = await adoptionContract.getPetOwners();
      expect(pets).to.eql(["FirstPet", "SecondPet"]);
      expect(owners).to.eql([contractDeployer.address, testSender1.address]);
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
      await adoptionContract.connect(testSender1).adoptAPet("FirstPet");
    });
    it("Claim award by pet", async () => {
      await adoptionContract.donate({
        value: ethers.utils.parseEther('0.1')
      });

      // check sender balance
      const testSender1Balance = await ethers.provider.getBalance(testSender1.address);
      const tx = await adoptionContract.connect(testSender1).claimAward();
      const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
      const gasPrice = await ethers.provider.getGasPrice();

      const expectedBalance = testSender1Balance.toBigInt() - receipt.gasUsed.toBigInt() * gasPrice.toBigInt() + ethers.utils.parseEther("0.01").toBigInt();

      expect(await ethers.provider.getBalance(testSender1.address)).to.be.eq(expectedBalance);

      // check contract balance
      const remain = await ethers.provider.getBalance(adoptionAddress);
      expect(remain).to.eq(ethers.utils.parseEther('0.09'));

      // check number of tx
      expect(await ethers.provider.getTransactionCount(adoptionContract.address)).to.be.eq(1);
    });
    it("Claim from owner but not adopter", async () => {
      await adoptionContract.donate({
        value: ethers.utils.parseEther('0.1')
      });
      expect(adoptionContract.claimAward()).to.be.revertedWith(
        "Only an adopter can claim his award and can only claim it once per adopted pet."
      );
    });
    it("Contract without funds", async () => {
      expect(adoptionContract.connect(testSender1).claimAward()).to.be.revertedWith(
        "Contract insufficient funds."
      );
    });
  });

});
