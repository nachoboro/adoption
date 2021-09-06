// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adoption {

    //DELETE ME
    uint256 public deleteMe;

    constructor() {
        //DELETE ME
        deleteMe = 1;
    }

    // DELETE ME
    function setDeleteMe(uint256 newDeleteMe) public {
        deleteMe = newDeleteMe + 5;
    }

    function sendPetToBeAdopted(string memory petName) public {
    }

    function getPetOwner(string memory petName) public view returns(address owner) {
    }

    //COMPLETE THE REST OF THE FUNCTION SIGNATURES
    // function adoptAPet(string petName)
    // function getPetOwners() 
    // function donate()
    // function claimAward()
}
