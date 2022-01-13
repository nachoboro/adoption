// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adoption {

    string[] public pets;
    uint256 public availableMoney;
    mapping(string => address) petsToOwnerMap;
    uint256 constant AWARD_PER_PET = 0.1 ether;

    struct claim {
        uint256 balance;
        bool isOwner;
    }

    mapping(address => claim) availableClaims;

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
        availableClaims[msg.sender] = claim(availableClaims[msg.sender].balance + AWARD_PER_PET, true);
    }

    function getPetOwners() public view returns(string[] memory, address[] memory _owners) {
        _owners = new address[](pets.length);
        for(uint i=0; i< pets.length; i++){
            _owners[i] = petsToOwnerMap[pets[i]];
        }
        return (pets, _owners);
    }

    function donate() payable public {
        availableMoney += msg.value;
    }

    function getAvailableMoney() public view returns(uint256) {
        return availableMoney;
    }

     function claimAward() payable public {
        require(availableClaims[msg.sender].isOwner, "Only owners can claim awards");

        uint256 balance = availableClaims[msg.sender].balance;
        require(balance > 0, "No Balance left to claim");
        require(availableMoney >= balance, "Insufficient money to claim balance");
        
        availableMoney -= balance;
        availableClaims[msg.sender].balance = 0;
    }

    function getUserClaims() public view returns(uint256) {
        return availableClaims[msg.sender].balance;
    }
}
