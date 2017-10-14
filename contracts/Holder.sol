pragma solidity ^0.4.4;

contract Holder {
    struct Data{
      bytes32 dataHash;
      address producer;
    }

    event DataSaved(bytes32 hash, address creator);

    address public owner;
    mapping (bytes32 => Data) dataMap;

    function addData(bytes32 dataType, bytes32 hashedData){
      DataSaved(hashedData, msg.sender);
      dataMap[dataType] = Data(hashedData, msg.sender);
    }

    function getDataType(bytes32 dataType) returns (bytes32, address){
      return (dataMap[dataType].dataHash, dataMap[dataType].producer);
    }

    function Holder() {
        owner = msg.sender;
    }

}
