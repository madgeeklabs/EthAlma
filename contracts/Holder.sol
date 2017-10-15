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

    //event DataSaved(string hash, address creator);

    address public owner;
    uint public amount;
    mapping (bytes32 => bytes32[]) dataMapDataHash;
    mapping (bytes32 => address[]) dataMapProducerAddress;
    mapping (address => uint) contributors;
    mapping (address => DataRequest) pendingDataRequests;
    // TODO make an array or hacked mapping
    address[] pendingDataRequestKeys;

    function addData(bytes32 dataType, bytes32 hashedData, address producerContract){
      //DataSaved(hashedData, msg.sender);
      dataMapDataHash[dataType].push(hashedData);
      dataMapProducerAddress[dataType].push(producerContract);
    }

    function requestData(bytes32 dataType, address contractAddress, string publickey) payable {
       amount += msg.value;
       contributors[contractAddress] = msg.value;
       // we should add msg.sender + dataType so that a user can ask for several things or block
       pendingDataRequests[msg.sender] = DataRequest(dataType, contractAddress);
       pendingDataRequestKeys.push(msg.sender);
    }

    function remove(address[] array, uint index) internal returns(address[] value) {
        if (index >= array.length) return;
        address[] memory arrayNew = new address[](array.length-1);
        for (uint i = 0; i<arrayNew.length; i++){
            if(i != index && i<index){
                arrayNew[i] = array[i];
            } else {
                arrayNew[i] = array[i+1];
            }
        }
        delete array;
        return arrayNew;
    }

    function releasePayments (uint index, bytes32 dataType){
        Producer(dataMapProducerAddress[dataType][index]).payForData.value(contributors[msg.sender])(dataType);
    }

    function approveRequestedData(address senderAddress, string IFPSHashAddress){
        DataRequest memory dataRequest = pendingDataRequests[senderAddress];
        // send money to dataMap[dataRequest.dataType].producer
        // Producer(dataMap[dataRequest.dataType].producer).payForData.value(contributors[senderAddress])(dataRequest.dataType);

        // substract money from ammount and contributors[senderAddress]

        Consumer(dataRequest.contractAddress)
        .responseData(IFPSHashAddress,
          dataMapDataHash[dataRequest.dataType],
          dataMapProducerAddress[dataRequest.dataType],
          dataRequest.dataType);

        // remove from map && array
        for (uint i = 0; i<pendingDataRequestKeys.length; i++){
            if (pendingDataRequestKeys[i] == senderAddress) {
              pendingDataRequestKeys =remove(pendingDataRequestKeys, i);
            }
        }
    }

    function getPendingRequest() returns (address[]){
      return pendingDataRequestKeys;
    }

    function getDataType(bytes32 dataType) returns (bytes32, bytes32[], address[]){
      return (dataType, dataMapDataHash[dataType], dataMapProducerAddress[dataType]);
    }

}
