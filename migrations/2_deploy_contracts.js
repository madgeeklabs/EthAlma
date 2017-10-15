var Producer = artifacts.require("./Producer.sol");
var Holder = artifacts.require("./Holder.sol");
var Consumer = artifacts.require("./Consumer.sol");

module.exports = function(deployer) {
  deployer.deploy(Producer);
  deployer.deploy(Holder);
  deployer.deploy(Consumer);
};
