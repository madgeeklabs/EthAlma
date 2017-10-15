pragma solidity ^0.4.4;

contract Producer {
    string public name;
    address public owner;
    bytes32[] trustedDataTypes;
    bytes32[] unTrustedDataTypes;
    mapping (bytes32 => address[]) trustNetworkMapping;
    mapping (bytes32 => address[]) unTrustNetworkMapping;

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

    function payForData(bytes32 dataType) payable {
      // keep statistics for datatype?
    }

    function addReview(bytes32 dataType, bool trust) {
      if (trust){
        trustNetworkMapping[dataType].push(msg.sender);
        trustedDataTypes.push(dataType);
      } else {
        unTrustNetworkMapping[dataType].push(msg.sender);
        unTrustedDataTypes.push(dataType);
      }
    }

    function getTrustedDataTypes() returns (bytes32[]) {
      return trustedDataTypes;
    }

    function getUnTrustedDataTypes() returns (bytes32[]) {
      return unTrustedDataTypes;
    }

    function getFollowers(bytes32 dataType) returns (address[]){
      return trustNetworkMapping[dataType];
    }

    function getHaters(bytes32 dataType) returns (address[]){
      return unTrustNetworkMapping[dataType];
    }

    function getMyBalance() returns (uint) {
      return this.balance;
    }

}
