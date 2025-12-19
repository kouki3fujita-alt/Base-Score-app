// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseScoreVerifier.sol";

contract BaseScore {
    
    BaseScoreVerifier public verifier;
    
    struct ScoreProof {
        address user;
        uint16 scoreLevel;
        uint8 tier; // 0=New, 1=Beginner, 2=Intermediate, 3=Advanced, 4=Elite
        uint256 validUntil;
        uint256 submittedAt;
    }
    
    mapping(address => ScoreProof) public scores;
    
    event ScoreSubmitted(address indexed user, uint16 scoreLevel, uint8 tier);
    
    constructor(address _verifier) {
        verifier = BaseScoreVerifier(_verifier);
    }
    
    function submitScore(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        require(verifier.verify(_proof, _publicInputs), "Invalid Proof");
        
        // Parse public inputs (Assuming input layout matches Noir circuit main.nr)
        // Public outputs in main.nr: threshold, score (returned), meets_threshold
        // Note: Noir public inputs structure depends on exact return/pub declarations.
        // For MVP mock, we decode manually or pass values explicitly if needed.
        
        // Mock parsing logic for MVP:
        // Assuming _publicInputs[0] is the score
        uint256 scoreVal = uint256(_publicInputs[0]);
        uint16 score16 = uint16(scoreVal);
        
        uint8 tier = 0;
        if (score16 >= 800) tier = 4; // Elite
        else if (score16 >= 600) tier = 3; // Advanced
        else if (score16 >= 400) tier = 2; // Intermediate
        else if (score16 >= 200) tier = 1; // Beginner
        
        scores[msg.sender] = ScoreProof({
            user: msg.sender,
            scoreLevel: score16,
            tier: tier,
            validUntil: block.timestamp + 30 days,
            submittedAt: block.timestamp
        });
        
        emit ScoreSubmitted(msg.sender, score16, tier);
    }
    
    function getScore(address _user) external view returns (ScoreProof memory) {
        return scores[_user];
    }
}
