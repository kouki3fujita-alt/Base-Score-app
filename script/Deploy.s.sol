// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/BaseScore.sol";
import "../contracts/BaseScoreVerifier.sol";

contract DeployBaseScore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Verifier
        BaseScoreVerifier verifier = new BaseScoreVerifier();
        console.log("BaseScoreVerifier deployed at:", address(verifier));

        // 2. Deploy BaseScore logic
        BaseScore baseScore = new BaseScore(address(verifier));
        console.log("BaseScore deployed at:", address(baseScore));

        vm.stopBroadcast();
    }
}
