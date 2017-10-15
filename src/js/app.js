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
      //App.contracts.Producer.new(); 0x1e46f36cbaca8d82aee9ad53483469e92931de7f
      //App.contracts.Producer.new(); 0x26ffa9c736af1186c1b0be8a04ac19617e532b7c
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

         var pendingDiv = $('#pendingDataResponses');
         var rowTemplate = $('#row_template');
         pendingDiv.empty();

         for(var x = 0; x < data.length; x++) {
             rowTemplate.find('.avatar-image').attr("src", "https://i.imgur.com/UPVxPjb.jpg");
             rowTemplate.find('.author-name').text(data[x]);
             rowTemplate.find('.btn').attr("id", "" + data[x] + "");
             rowTemplate.find('.btn').attr("data-index", "" + x + "");
             pendingDiv.append(rowTemplate.html());
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
         var pendingDiv = $('#pending_div_holder');
         var rowTemplate = $('#row_template');
         pendingDiv.empty();

         for(var x = 0; x < data.length; x++) {
             rowTemplate.find('.avatar-image').attr("src", "http://www.alwaystakingcare.ca/images/lcbo-logo.png");
             rowTemplate.find('.author-name').text(data[x]);
             rowTemplate.find('.btn').attr("id", "" + data[x] + "");
             pendingDiv.append(rowTemplate.html());
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

       App.contracts.Holder.deployed()
       .then(function(instance){
          return instance.getDataType.call('nationality');
        })
        .then(function(data){
          var array = data[1];
          var pendingDiv = $('#information_holder');
          var rowTemplate = $('#row_template_no_button');
          pendingDiv.empty();

          for(var x = 0; x < data[1].length; x++) {
              rowTemplate.find('.avatar-image').attr("src", "https://qph.ec.quoracdn.net/main-qimg-0a43ba9f3eeb647b439e4b5d5d6dcbb1");
              rowTemplate.find('.author-name').text(data[2][x]);
              rowTemplate.find('.author-store').text(web3.toUtf8(data[1][x]));
              pendingDiv.append(rowTemplate.html());
          }

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

       var pendingDiv = $('#producer_followers');
       var rowTemplate = $('#row_template');
       pendingDiv.empty();

       for(var x = 0; x < data.length; x++) {
           rowTemplate.find('.avatar-image').attr("src", "http://www.alwaystakingcare.ca/images/lcbo-logo.png");
           rowTemplate.find('.author-name').text(data[x]);
           rowTemplate.find('.store-name').text('LCBO');
           pendingDiv.append(rowTemplate.html());
       }
       console.log(data);
     });

     App.contracts.Producer.deployed()
     .then(function(instance){
        return instance.getHaters.call("nationality");
      })
      .then(function(data){
        var pendingDiv = $('#producer_haters');
        var rowTemplate = $('#row_template');
        pendingDiv.empty();

        for(var x = 0; x < 1; x++) {
            rowTemplate.find('.avatar-image').attr("src", "https://i.imgur.com/MQ0oCKc.jpg");
            rowTemplate.find('.store-name').text("kim jong un");
            rowTemplate.find('.author-name').text("0x1e46f36cbaca8d82aee9ad53483469e92931de7f");
            pendingDiv.append(rowTemplate.html());
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
    console.log('clicked on ', targetId);
    // obtain data with our key
    var ipfsAddress = "0123123123";

    // save into ipfs with requester key
    App.contracts.Holder.deployed()
    .then(function(instance){
      instance.approveRequestedData(targetId, ipfsAddress);
    });

  },

  test_getData: function(){
    App.contracts.Holder.deployed()
    .then(function(instance){
      return instance.getDataType.call('nationality');
    })
    .then(function(data){
      for (var x = 0; x < data.length; x++){
        console.log(data[x]);
      }
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
    var index = event.target.getAttribute('data-index');
    console.log('clicked on ',index, targetId);
    // obtain data with our key
    var ipfsAddress = "0123123123";

    App.contracts.Consumer.deployed()
    .then(function(instance){
        instance.reviewResponseData(index, targetId, true);
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
            //var data_sha = sha1(JSON.stringify(data_to_save));
            var data_sha = 'small';
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
