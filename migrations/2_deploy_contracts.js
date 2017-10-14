var Producer = artifacts.require("./Producer.sol");
var Holder = artifacts.require("./Holder.sol");

module.exports = function(deployer) {
  deployer.deploy(Producer);
  deployer.deploy(Holder);
};
