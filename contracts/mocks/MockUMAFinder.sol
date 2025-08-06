// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockUMAFinder {
    mapping(bytes32 => address) private implementations;
    
    constructor() {
        // Set up mock implementations
        implementations[keccak256("CollateralWhitelist")] = address(this);
    }
    
    function getImplementationAddress(bytes32 interfaceName) external view returns (address) {
        return implementations[interfaceName];
    }
    
    function isOnWhitelist(address token) external pure returns (bool) {
        return true; // Mock always returns true
    }
} 