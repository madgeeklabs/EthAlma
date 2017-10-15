pragma solidity ^0.4.4;

contract Producer {
    string public name;
    address public owner;
    string[8] trustedDataTypes;
    string[8] unTrustedDataTypes;
    uint indexTrustedDataTypes;
    uint indexUntrustedDataTypes;
    mapping (string => address[]) trustNetworkMapping;
    mapping (string => address[]) unTrustNetworkMapping;

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

    function addReview(string dataType, bool trust) {
      if (trust){
        trustNetworkMapping[dataType].push(msg.sender);
        trustedDataTypes[indexTrustedDataTypes] = dataType;
        indexTrustedDataTypes++;
      } else {
        unTrustNetworkMapping[dataType].push(msg.sender);
        unTrustedDataTypes[indexUntrustedDataTypes] = dataType;
        indexUntrustedDataTypes++;
      }
    }

    function getTrustedDataTypes() returns (string[8]) {
      return trustedDataTypes;
    }

    function getUnTrustedDataTypes() returns (string[8]) {
      return unTrustedDataTypes;
    }

    function getFollowers(string dataType) returns (address[]){
      return trustNetworkMapping[dataType];
    }

    function getHaters(string dataType) returns (address[]){
      return unTrustNetworkMapping[dataType];
    }

    function getMyBalance() returns (uint) {
      return this.balance;
    }

}
