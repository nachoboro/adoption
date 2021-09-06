// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adoption {

    string[] public pets;

    // default address: address(0)
    mapping (string => address) public petToAdopter;

    // default uint8: 0
    mapping (address => uint8) public numberOfRemainingAwardsByAdopter;

    function sendPetToBeAdopted(string memory petName) public {
        // abort if address is different to address(0)
        require(petToAdopter[petName] == address(0), "Pet already created.");
        pets.push(petName);
        petToAdopter[petName] = msg.sender;
    }

    function getPetOwner(string memory petName) public view returns(address owner) {
        return petToAdopter[petName];
    }

    function adoptAPet(string memory petName) public {
        // abort if call comes from current owner
        require(petToAdopter[petName] != msg.sender, "Pet cannot be adopted by the current owner.");
        petToAdopter[petName] = msg.sender;
        // increment for reward
        numberOfRemainingAwardsByAdopter[msg.sender] += 1;
    }

    function getPetOwners() public view returns(string[] memory, address[] memory _owners) {
        // only fixed arrays allowed in 'memory' space
        _owners = new address[](pets.length);
        for (uint i=0; i < pets.length; i++) {
            _owners[i] = petToAdopter[pets[i]];
        }
        return (pets, _owners);
    }

    function donate() public payable {
        // no code here (?)
    }
    
    function claimAward() public {
        // abort if the address doesn't contain any award to claim
        require(
            numberOfRemainingAwardsByAdopter[msg.sender] > 0,
            "Only an adopter can claim his award and can only claim it once per adopted pet."
        );
        // 0.01 ETH (0.01x10^18)
        require(
            address(this).balance > 10000000000000000,
            "Contract insufficient funds"
        );
        // order is important here, in order to avoid security issues
        numberOfRemainingAwardsByAdopter[msg.sender] -= 1;
        payable(msg.sender).transfer(10000000000000000);
    }
}
