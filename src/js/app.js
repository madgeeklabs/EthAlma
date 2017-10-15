App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */

    $.getJSON('Producer.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ProducerArtifact = data;
      App.contracts.Producer = TruffleContract(ProducerArtifact);
      // Set the provider for our contract
      App.contracts.Producer.setProvider(App.web3Provider);
      // Listen to events of contract
    });
    $.getJSON('Holder.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var HolderArtifact = data;
      App.contracts.Holder = TruffleContract(HolderArtifact);
      // Set the provider for our contract
      App.contracts.Holder.setProvider(App.web3Provider);

      App.contracts.Holder.deployed()
      .then(function(instance){
        $('#holderAddress').text(instance.address);
         instance.DataSaved({fromBlock: 0, toBlock: 'latest'})
         .watch(function(error, result) {
           console.log('epa', result.args);
         });
      });

    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#test_getData', App.test_getData);
    //PRODUCER
    $(document).on('click', '#producer_addData', App.producer_addData);
    //CONSUMER
    $(document).on('click', '#consumer_requestData', App.consumer_requestData);
    //HOLDER
    $(document).on('click', '#holder_getPendingRequests', App.holder_getPendingRequests);
  },

  holder_getPendingRequests: function(){
    web3.eth.getAccounts(function(error, accounts) {
        App.contracts.Holder.deployed()
        .then(function(instance){
           return instance.getPendingRequest.call();
         })
         .then(function(data){
           console.log(data);
         });
    });
  },

  test_getData: function(){
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.Holder.deployed()
        .then(function(instance){
           return instance.getDataType.call('nationality', {from: account});
         })
         .then(function(data){
           for (var x = 0; x < data.length; x++){
             console.log(data[x]);
           }
         });
    });
  },

  consumer_requestData: function (){
    event.preventDefault();
    // var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        var consumerContractAddress = '0x5e2bd5b0ce115d45bd319189d873378d589d35c0';
        var publickey = 'abcd1234';
        App.contracts.Holder.deployed()
        .then(function(instance){
          instance.requestData('nationality', consumerContractAddress, publickey, {from: account, value: web3.toWei(1, 'ether')});
        });
    });
  },

  producer_addData: function() {
    event.preventDefault();
    // var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];

        App.contracts.Holder.deployed()
        .then(function(instance){
          var data_to_save = {'value':'ES'};
          var data_sha = sha1(JSON.stringify(data_to_save));
           instance.addData('nationality', data_sha, {from: account});
        });
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
