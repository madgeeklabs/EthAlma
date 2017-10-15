pragma solidity ^0.4.4;

contract Consumer {

    /*event PetAdopted(uint petId);*/
    struct ResponseData{
      string dataSha;
      address producerAddress;
    }

    mapping (bytes32 => ResponseData) public dataPendingRating;
    bytes32[] public dataPendingRatingKeys;

    function Consumer() {
    }

    function responseData(string dataSha, address producerAddress){

    }



}
