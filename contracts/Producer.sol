pragma solidity ^0.4.4;

contract SpainGov {
    bytes32 public name;
    address public owner;

    /*event PetAdopted(uint petId);*/

    function SpainGov() {
        owner = msg.sender;
        name = "unasigned"
    }

    function getInfo() returns (bytes32 lalal){
        return name;
    }

    function setName(bytes32 pName){
        name = pName;
    }

}
