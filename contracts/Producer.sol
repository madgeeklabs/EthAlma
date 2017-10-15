pragma solidity ^0.4.4;

contract Producer {
    string public name;
    address public owner;

    /*event PetAdopted(uint petId);*/

    function Producer() {
        owner = msg.sender;
        name = "noname";
    }

    function getInfo() returns (string){
        return name;
    }

    function setName(string pName){
        name = pName;
    }

    function payForData(string dataType) payable {
      // keep statistics for datatype?
    }

}
