pragma solidity ^0.4.4;

import './Producer.sol';
import './Consumer.sol';


contract Holder {
    struct Data{
      string dataHash;
      address producer;
    }

    struct DataRequest{
      bytes32 dataType;
      address contractAddress;
    }

    event DataSaved(string hash, address creator);

    address public owner;
    uint public amount;
    mapping (bytes32 => Data) dataMap;
    mapping (address => uint) contributors;
    mapping (address => DataRequest) pendingDataRequests;
    // TODO make an array or hacked mapping
    address[] pendingDataRequestKeys;

    function addData(bytes32 dataType, string hashedData, address producerContract){
      DataSaved(hashedData, msg.sender);
      dataMap[dataType] = Data(hashedData, producerContract);
    }

    function requestData(bytes32 dataType, address contractAddress, string publickey) payable {
       amount += msg.value;
       contributors[msg.sender] = msg.value;
       // we should add msg.sender + dataType so that a user can ask for several things or block
       pendingDataRequests[msg.sender] = DataRequest(dataType, contractAddress);
       pendingDataRequestKeys.push(msg.sender);
    }

    function approveRequestedData(address senderAddress, string IFPSHashAddress){
        DataRequest memory dataRequest = pendingDataRequests[senderAddress];
        // remove from map && array
        // send money to dataMap[dataRequest.dataType].producer
        Producer(dataMap[dataRequest.dataType].producer).payForData.value(contributors[senderAddress])(dataRequest.dataType);

        // substract money from ammount and contributors[senderAddress]
        Consumer(dataRequest.contractAddress)
        .responseData(IFPSHashAddress,
          dataMap[dataRequest.dataType].dataHash,
          dataMap[dataRequest.dataType].producer,
          dataRequest.dataType);
    }

    function getPendingRequest() returns (address[]){
      return pendingDataRequestKeys;
    }

    function getDataType(bytes32 dataType) returns (bytes32, string, address){
      return (dataType, dataMap[dataType].dataHash, dataMap[dataType].producer);
    }

}
