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

    setInterval(function(){
      App.updateHolder();
      App.updateConsumer();
      App.updateProducer();
    }, 5000);

    $.getJSON('Consumer.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ConsumerArtifact = data;
      App.contracts.Consumer = TruffleContract(ConsumerArtifact);
      // Set the provider for our contract
      App.contracts.Consumer.setProvider(App.web3Provider);
    });

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

  updateConsumer: function(){
      App.contracts.Consumer.deployed()
      .then(function(instance){
         return instance.getPendingResponses.call();
       })
       .then(function(data){
         for(var x = 0; x < data.length; x++){
           $("#pendingDataResponses").empty();
           $("#pendingDataResponses").append("<li>"+ data[x] + "<button class='approveDataResponse' id='" + data[x] +"'>Approve</button></li>");
         }
         console.log(data);
       });
  },

  updateHolder: function(){
      App.contracts.Holder.deployed()
      .then(function(instance){
         return instance.getPendingRequest.call();
       })
       .then(function(data){
         for(var x = 0; x < data.length; x++) {
           $("#pendingDataRequests").empty();
           $("#pendingDataRequests").append("<li>"+ data[x] + "<button class='approveDataRequest' id='" + data[x] +"'>Approve</button></li>");
         }
         console.log(data);
       });

       App.contracts.Holder.deployed()
       .then(function(instance){
         web3.eth.getBalance(instance.address, function(error, res){
           //console.log('holder', res.c[0]);
           $('#holder_balance').text(res.c[0]/10000);
         });
       });
  },

  updateProducer: function() {
    // updateBalance
    App.contracts.Producer.deployed()
    .then(function(instance){
      web3.eth.getBalance(instance.address, function(error, res){
        //console.log('producer', res.c[0]);
          $('#producer_balance').text(res.c[0]/10000);
      });
    });

    App.contracts.Producer.deployed()
    .then(function(instance){
       return instance.getFollowers.call("nationality");
     })
     .then(function(data){
       for(var x = 0; x < data.length; x++) {
         $("#producer_followers").empty();
         $("#producer_followers").append("<li class='followers'>"+ data[x] + "</li>");
       }
       console.log(data);
     });

     App.contracts.Producer.deployed()
     .then(function(instance){
        return instance.getHaters.call("nationality");
      })
      .then(function(data){
        for(var x = 0; x < data.length; x++) {
          $("#producer_haters").empty();
          $("#producer_haters").append("<li class='haters'>"+ data[x] + "</li>");
        }
        console.log(data);
      });
  },

  bindEvents: function() {
    $(document).on('click', '#test_getData', App.test_getData);
    //PRODUCER
    $(document).on('click', '#producer_addData', App.producer_addData);
    //$(document).on('click', '#producer_updateBalance', App.producer_producerBalance);
    //CONSUMER
    $(document).on('click', '#consumer_requestData', App.consumer_requestData);
    $(document).on('click', '.approveDataResponse', App.consumer_approveDataResponse);
    //HOLDER
    $(document).on('click', '.approveDataRequest', App.holder_approveDataRequest);
  },

  // HOLDER
  holder_approveDataRequest: function(){
    event.preventDefault();
    var targetId = event.target.id;
    console.log('clicked on ',targetId);
    // obtain data with our key
    var ipfsAddress = "0123123123";

    // save into ipfs with requester key
    App.contracts.Holder.deployed()
    .then(function(instance){
      instance.approveRequestedData(targetId, ipfsAddress);
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

  // CONSUMER
  consumer_requestData: function (){
    event.preventDefault();
    // var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        var publickey = 'abcd1234';
        App.contracts.Consumer.deployed()
        .then(function (consumerInstance){
          App.contracts.Holder.deployed()
          .then(function(instance){
            instance.requestData('nationality', consumerInstance.address, publickey, {from: account, value: web3.toWei(1, 'ether')});
          });
        });

    });
  },

  consumer_approveDataResponse: function(){
    event.preventDefault();
    var targetId = event.target.id;
    console.log('clicked on ',targetId);
    // obtain data with our key
    var ipfsAddress = "0123123123";

    App.contracts.Consumer.deployed()
    .then(function(instance){
        instance.reviewResponseData(targetId, true);
    });
  },

  // PRODUCER

  producer_addData: function() {
    event.preventDefault();
    // var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        var producerInstanceAddress;
        App.contracts.Producer.deployed()
        .then(function (producerInstance){
          return producerInstance.address;
        })
        .then(function (producerAddress){
          App.contracts.Holder.deployed()
          .then(function(instance){
            var data_to_save = {'value':'ES'};
            var data_sha = sha1(JSON.stringify(data_to_save));
             instance.addData('nationality', data_sha, producerAddress, {from: account});
          });
        });
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
