// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockOptimisticOracle {
    mapping(bytes32 => bool) private assertions;
    mapping(address => uint256) private minimumBonds;
    
    constructor() {
        // Set default minimum bond
        minimumBonds[address(0)] = 50 * 10**18;
    }
    
    function defaultIdentifier() external pure returns (bytes32) {
        return keccak256("DEFAULT_IDENTIFIER");
    }
    
    function getMinimumBond(address currency) external view returns (uint256) {
        return minimumBonds[currency] > 0 ? minimumBonds[currency] : 50 * 10**18;
    }
    
    function assertTruth(
        bytes memory claim,
        address asserter,
        address callbackRecipient,
        address sovereignSecurity,
        uint64 liveness,
        address currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domain
    ) external returns (bytes32 assertionId) {
        assertionId = keccak256(abi.encodePacked(claim, asserter, block.timestamp));
        assertions[assertionId] = true;
        return assertionId;
    }
    
    function simulateAssertionResolved(bytes32 assertionId, bool truthful) external {
        // Mock function to simulate UMA callback
        if (truthful) {
            // Simulate successful resolution
            assertions[assertionId] = true;
        }
    }
    
    function getAssertion(bytes32 assertionId) external view returns (bool) {
        return assertions[assertionId];
    }
} 