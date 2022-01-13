// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adoption {

    string[] public pets;
    mapping(string => address) petsToOwnerMap;
    uint256 constant AWARD_PER_PET = 0.1 ether;

    mapping(address => uint8) availableClaims;

    function sendPetToBeAdopted(string memory petName) public {
        pets.push(petName);
        petsToOwnerMap[petName] = msg.sender;
    }

    function getPetOwner(string memory petName) public view returns(address owner) {
        return petsToOwnerMap[petName];
    }

    function adoptAPet(string memory petName) public {
        require(msg.sender != petsToOwnerMap[petName], "Cannot adopt a pet you already Own");
        petsToOwnerMap[petName] = msg.sender;
        availableClaims[msg.sender] = availableClaims[msg.sender] + 1;
    }

    function getPetOwners() public view returns(string[] memory, address[] memory owners) {
        owners = new address[](pets.length);
        for(uint i=0; i< pets.length; i++){
            owners[i] = petsToOwnerMap[pets[i]];
        }
        return (pets, owners);
    }

    function donate() payable public {}

    function claimAward() payable public {
        uint8 balance = availableClaims[msg.sender];
        require(balance > 0 , "Only owners can claim awards when their balance is greater than 0");

        uint256 totalToTransfer = balance * AWARD_PER_PET;
        require(address(this).balance >= totalToTransfer, "Insufficient money to claim balance");
        
        availableClaims[msg.sender] = 0;
        payable(msg.sender).transfer(totalToTransfer);
    }
}
