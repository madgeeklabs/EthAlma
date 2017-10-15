pragma solidity ^0.4.4;
import './Producer.sol';

contract Consumer {
    struct ResponseData{
      string ipfsHashEncryptedData;
      string dataHash;
      address producerAddress;
      bytes32 dataType;
    }

    mapping (address => ResponseData) public dataPendingRating;
    address[] public dataPendingRatingKeys;

    function reviewResponseData(address holderAddress, bool trust) {
      ResponseData memory responseData = dataPendingRating[holderAddress];
      Producer(responseData.producerAddress).addReview(responseData.dataType, trust);
    }

    function responseData(string ipfsHashEncryptedData, string dataHash, address producerAddress, bytes32 dataType){
        dataPendingRating[msg.sender] = ResponseData(ipfsHashEncryptedData, dataHash, producerAddress, dataType);
        dataPendingRatingKeys.push(msg.sender);
    }

    function getResponseData(address holderAddress) returns (string, string, address, bytes32){
        ResponseData memory to_ret = dataPendingRating[holderAddress];
        return (to_ret.ipfsHashEncryptedData, to_ret.dataHash, to_ret.producerAddress, to_ret.dataType);
    }

    function getPendingResponses() returns (address[]){
      return dataPendingRatingKeys;
    }

}
