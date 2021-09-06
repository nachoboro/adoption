// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adoption {

    string[] pets;

    mapping (string => address) public petToAdopter;

    mapping (address => uint8) public numberOfRemainingAwardsByAdopter;

    constructor() {}

    function sendPetToBeAdopted(string memory petName) public {
        require(petToAdopter[petName] == address(0), "Pet already created.");
        pets.push(petName);
        petToAdopter[petName] = msg.sender;
        numberOfRemainingAwardsByAdopter[msg.sender] += 1;
    }

    function getPetOwner(string memory petName) public view returns(address owner) {
        return petToAdopter[petName];
    }

    function adoptAPet(string memory petName) public {
        require(petToAdopter[petName] != msg.sender, "Pet cannot be adopted by the current owner.");
        petToAdopter[petName] = msg.sender;
        numberOfRemainingAwardsByAdopter[msg.sender] += 1;
    }

    function getPetOwners() public view returns(string[] memory, address[] memory) {
        address[] memory owners_o = new address[](pets.length);
        for (uint i=0; i < pets.length; i++) {
            owners_o[i] = petToAdopter[pets[i]];
        }
        return (pets, owners_o);
    }

    function donate() public {
    }
    
    function claimAward() public {
        bool validClaimer = false;
        for (uint i=0; i < pets.length; i++) {
            if (msg.sender == petToAdopter[pets[i]]) {
                validClaimer = true;
                break;
            }
        }
        require(validClaimer && numberOfRemainingAwardsByAdopter[msg.sender] > 0, "Only a pet owner that has adopted can claim his award and can only claim it once per adopted pet.");
        // 0.01 ETH (0.01x10^18)
        payable(msg.sender).transfer(10000000000000000);
        numberOfRemainingAwardsByAdopter[msg.sender] -= 1;
    }
}
