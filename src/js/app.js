App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    String.prototype.hashCode = function() {
      var hash = 0, i, chr;
      if (this.length === 0) return hash;
       for (i = 0; i < this.length; i++) {
         chr = this.charCodeAt(i); hash = ((hash << 5) - hash) + chr;
         hash |= 0; // Convert to 32bit integer
       }
       return hash;
     };
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
         instance.DataSaved({fromBlock: 0, toBlock: 'latest'})
         .watch(function(error, result) {
           console.log('epa', result.args);
         });
      });

    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#addData', App.addData);
    $(document).on('click', '#getData', App.getData);
  },

  getData: function(){
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
             console.log(data[0], web3.toUtf8(data[0]));
             console.log(data[1]);
         });
    });
  },

  addData: function() {
    console.log('one');
    event.preventDefault();

    // var petId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];

        App.contracts.Producer.deployed()
        .then(function(instance){
          console.log(instance);
        instance.setName('111 2222 33333 44444 55555 666666 7777777  88888888 99999999', {from: account});
          return instance.getInfo.call();
         })
        .then(function (getInfoData) {
            console.log(web3.toUtf8(getInfoData));
        });

        App.contracts.Holder.deployed()
        .then(function(instance){
          var data_to_save = {'value':'ES'};
          var data_sha = JSON.stringify(data_to_save).hashCode();
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
