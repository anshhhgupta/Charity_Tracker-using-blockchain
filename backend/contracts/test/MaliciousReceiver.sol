// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title MaliciousReceiver
 * @notice Test contract to verify reentrancy protection
 * @dev This contract attempts to reenter the Charity contract
 */
contract MaliciousReceiver {
    address public charityContract;
    uint256 public attackCount;
    bool public attacking;

    constructor(address _charityContract) {
        charityContract = _charityContract;
        attackCount = 0;
        attacking = false;
    }

    // Fallback function that attempts reentrancy
    receive() external payable {
        if (!attacking && attackCount < 3) {
            attacking = true;
            attackCount++;
            
            // Attempt to call executeExpenditure again (reentrancy attack)
            try ICharity(charityContract).executeExpenditure(0, 0) {
                // If this succeeds, reentrancy guard failed
            } catch {
                // Expected to fail due to reentrancy guard
            }
            
            attacking = false;
        }
    }

    // Function to trigger attack
    function attack() external {
        attackCount = 0;
        attacking = false;
    }
}

interface ICharity {
    function executeExpenditure(uint256 campaignId, uint256 expenditureId) external;
}
