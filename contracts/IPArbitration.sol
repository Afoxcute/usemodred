// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uma/core/contracts/common/implementation/AddressWhitelist.sol";
import "@uma/core/contracts/common/implementation/ExpandedERC20.sol";
import "@uma/core/contracts/data-verification-mechanism/implementation/Constants.sol";
import "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import "@uma/core/contracts/optimistic-oracle-v3/implementation/ClaimData.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";

/**
 * @title IPArbitration
 * @dev Smart contract for decentralized arbitration of IP asset disputes using UMA's Optimistic Oracle V3.
 * This contract allows parties to create dispute markets for IP-related conflicts and resolve them
 * through decentralized arbitration with economic incentives.
 */
contract IPArbitration is OptimisticOracleV3CallbackRecipientInterface, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Dispute status enumeration
    enum DisputeStatus {
        Pending,        // Dispute created, waiting for evidence submission
        EvidenceSubmitted, // Evidence submitted, waiting for arbitration
        Arbitrating,    // Under arbitration through UMA
        Resolved,       // Dispute resolved with outcome
        Cancelled       // Dispute cancelled
    }

    // Dispute outcome enumeration
    enum DisputeOutcome {
        None,           // No outcome yet
        PlaintiffWins,  // Plaintiff wins the dispute
        DefendantWins,  // Defendant wins the dispute
        Split,          // Split decision (partial win for both)
        Invalid         // Invalid dispute
    }

    struct Dispute {
        bytes32 disputeId;                    // Unique identifier for the dispute
        address plaintiff;                     // Address of the plaintiff
        address defendant;                     // Address of the defendant
        address ipAssetContract;              // Contract address of the IP asset
        uint256 ipAssetTokenId;               // Token ID of the IP asset
        uint256 licenseId;                    // License ID involved in dispute
        string description;                    // Description of the dispute
        string evidence;                      // Evidence submitted by parties
        uint256 reward;                       // Reward for successful arbitration
        uint256 requiredBond;                 // Required bond for arbitration
        uint64 createdAt;                     // Timestamp when dispute was created
        uint64 evidenceDeadline;              // Deadline for evidence submission
        DisputeStatus status;                 // Current status of the dispute
        DisputeOutcome outcome;               // Final outcome of the dispute
        bytes32 assertionId;                  // UMA assertion ID
        address arbitrator;                   // Address of the arbitrator
        uint256 plaintiffStake;               // Stake provided by plaintiff
        uint256 defendantStake;               // Stake provided by defendant
    }

    struct AssertedDispute {
        address arbitrator;                   // Address of the arbitrator
        bytes32 disputeId;                   // Identifier for disputes mapping
        DisputeOutcome assertedOutcome;      // Outcome asserted by arbitrator
    }

    // State variables
    mapping(bytes32 => Dispute) public disputes;                    // Maps disputeId to Dispute struct
    mapping(bytes32 => AssertedDispute) public assertedDisputes;   // Maps assertionId to AssertedDispute
    mapping(address => bool) public authorizedArbitrators;         // Authorized arbitrators
    mapping(address => uint256) public arbitratorRewards;          // Rewards earned by arbitrators

    // UMA integration
    FinderInterface public immutable finder;
    IERC20 public immutable currency;
    OptimisticOracleV3Interface public immutable oo;
    uint64 public constant assertionLiveness = 7200; // 2 hours
    bytes32 public immutable defaultIdentifier;
    
    // Dispute parameters
    uint256 public constant MINIMUM_REWARD = 100 * 10**18;        // Minimum reward in wei
    uint256 public constant MINIMUM_BOND = 50 * 10**18;           // Minimum bond in wei
    uint64 public constant EVIDENCE_PERIOD = 7 days;              // Evidence submission period
    uint256 public constant ARBITRATOR_FEE_PERCENTAGE = 10;       // 10% fee for arbitrators
    
    // Events
    event DisputeCreated(
        bytes32 indexed disputeId,
        address indexed plaintiff,
        address indexed defendant,
        address ipAssetContract,
        uint256 ipAssetTokenId,
        uint256 licenseId,
        string description,
        uint256 reward,
        uint256 requiredBond
    );
    
    event EvidenceSubmitted(
        bytes32 indexed disputeId,
        address indexed submitter,
        string evidence
    );
    
    event DisputeArbitrated(
        bytes32 indexed disputeId,
        address indexed arbitrator,
        DisputeOutcome outcome,
        bytes32 indexed assertionId
    );
    
    event DisputeResolved(
        bytes32 indexed disputeId,
        DisputeOutcome outcome,
        uint256 plaintiffPayout,
        uint256 defendantPayout,
        uint256 arbitratorReward
    );
    
    event ArbitratorAuthorized(address indexed arbitrator);
    event ArbitratorDeauthorized(address indexed arbitrator);
    event RewardWithdrawn(address indexed arbitrator, uint256 amount);

    // Modifiers
    modifier onlyArbitrator() {
        require(authorizedArbitrators[msg.sender], "Not authorized arbitrator");
        _;
    }
    
    modifier onlyDisputeParty(bytes32 disputeId) {
        Dispute storage dispute = disputes[disputeId];
        require(
            msg.sender == dispute.plaintiff || msg.sender == dispute.defendant,
            "Not a party to this dispute"
        );
        _;
    }
    
    modifier onlyDisputeExists(bytes32 disputeId) {
        require(disputes[disputeId].disputeId != bytes32(0), "Dispute does not exist");
        _;
    }

    constructor(
        address _finder,
        address _currency,
        address _optimisticOracleV3
    ) {
        finder = FinderInterface(_finder);
        require(_getCollateralWhitelist().isOnWhitelist(_currency), "Unsupported currency");
        currency = IERC20(_currency);
        oo = OptimisticOracleV3Interface(_optimisticOracleV3);
        defaultIdentifier = oo.defaultIdentifier();
    }

    /**
     * @dev Create a new IP dispute
     * @param defendant Address of the defendant
     * @param ipAssetContract Contract address of the IP asset
     * @param ipAssetTokenId Token ID of the IP asset
     * @param licenseId License ID involved in dispute
     * @param description Description of the dispute
     * @param reward Reward for successful arbitration
     * @param requiredBond Required bond for arbitration
     */
    function createDispute(
        address defendant,
        address ipAssetContract,
        uint256 ipAssetTokenId,
        uint256 licenseId,
        string memory description,
        uint256 reward,
        uint256 requiredBond
    ) external returns (bytes32 disputeId) {
        require(defendant != address(0), "Invalid defendant address");
        require(ipAssetContract != address(0), "Invalid IP asset contract");
        require(bytes(description).length > 0, "Empty description");
        require(reward >= MINIMUM_REWARD, "Reward too low");
        require(requiredBond >= MINIMUM_BOND, "Bond too low");
        require(defendant != msg.sender, "Cannot dispute yourself");

        disputeId = keccak256(abi.encode(
            msg.sender,
            defendant,
            ipAssetContract,
            ipAssetTokenId,
            licenseId,
            block.timestamp
        ));
        
        require(disputes[disputeId].disputeId == bytes32(0), "Dispute already exists");

        // Transfer reward from plaintiff
        currency.safeTransferFrom(msg.sender, address(this), reward);

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            plaintiff: msg.sender,
            defendant: defendant,
            ipAssetContract: ipAssetContract,
            ipAssetTokenId: ipAssetTokenId,
            licenseId: licenseId,
            description: description,
            evidence: "",
            reward: reward,
            requiredBond: requiredBond,
            createdAt: uint64(block.timestamp),
            evidenceDeadline: uint64(block.timestamp + EVIDENCE_PERIOD),
            status: DisputeStatus.Pending,
            outcome: DisputeOutcome.None,
            assertionId: bytes32(0),
            arbitrator: address(0),
            plaintiffStake: 0,
            defendantStake: 0
        });

        emit DisputeCreated(
            disputeId,
            msg.sender,
            defendant,
            ipAssetContract,
            ipAssetTokenId,
            licenseId,
            description,
            reward,
            requiredBond
        );
    }

    /**
     * @dev Submit evidence for a dispute
     * @param disputeId ID of the dispute
     * @param evidence Evidence to submit
     */
    function submitEvidence(
        bytes32 disputeId,
        string memory evidence
    ) external onlyDisputeParty(disputeId) onlyDisputeExists(disputeId) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Pending, "Dispute not in pending status");
        require(block.timestamp <= dispute.evidenceDeadline, "Evidence deadline passed");
        require(bytes(evidence).length > 0, "Empty evidence");

        dispute.evidence = string(abi.encodePacked(
            dispute.evidence,
            "\n--- Evidence from ",
            _addressToString(msg.sender),
            " ---\n",
            evidence
        ));

        emit EvidenceSubmitted(disputeId, msg.sender, evidence);
    }

    /**
     * @dev Start arbitration process for a dispute
     * @param disputeId ID of the dispute to arbitrate
     * @param assertedOutcome Outcome asserted by the arbitrator
     */
    function arbitrateDispute(
        bytes32 disputeId,
        DisputeOutcome assertedOutcome
    ) external onlyArbitrator onlyDisputeExists(disputeId) returns (bytes32 assertionId) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Pending, "Dispute not in pending status");
        require(block.timestamp > dispute.evidenceDeadline, "Evidence period not ended");
        require(assertedOutcome != DisputeOutcome.None, "Invalid outcome");

        dispute.status = DisputeStatus.Arbitrating;
        dispute.arbitrator = msg.sender;
        dispute.outcome = assertedOutcome;

        // Calculate bond amount
        uint256 minimumBond = oo.getMinimumBond(address(currency));
        uint256 bond = dispute.requiredBond > minimumBond ? dispute.requiredBond : minimumBond;

        // Transfer bond from arbitrator
        currency.safeTransferFrom(msg.sender, address(this), bond);

        // Compose claim for UMA
        bytes memory claim = _composeIPDisputeClaim(dispute, assertedOutcome);

        // Make assertion to UMA
        currency.safeApprove(address(oo), bond);
        assertionId = _assertTruthWithDefaults(claim, bond);

        // Store assertion details
        assertedDisputes[assertionId] = AssertedDispute({
            arbitrator: msg.sender,
            disputeId: disputeId,
            assertedOutcome: assertedOutcome
        });

        dispute.assertionId = assertionId;

        emit DisputeArbitrated(disputeId, msg.sender, assertedOutcome, assertionId);
    }

    /**
     * @dev UMA callback for resolved assertions
     * @param assertionId ID of the assertion
     * @param assertedTruthfully Whether the assertion was truthful
     */
    function assertionResolvedCallback(
        bytes32 assertionId,
        bool assertedTruthfully
    ) external override {
        require(msg.sender == address(oo), "Not authorized");
        
        AssertedDispute storage assertedDispute = assertedDisputes[assertionId];
        Dispute storage dispute = disputes[assertedDispute.disputeId];

        if (assertedTruthfully) {
            dispute.status = DisputeStatus.Resolved;
            dispute.outcome = assertedDispute.assertedOutcome;
            
            // Calculate payouts
            _distributePayouts(assertedDispute.disputeId, assertedDispute.assertedOutcome);
            
            // Award arbitrator
            uint256 arbitratorReward = (dispute.reward * ARBITRATOR_FEE_PERCENTAGE) / 100;
            arbitratorRewards[assertedDispute.arbitrator] += arbitratorReward;
            
            emit DisputeResolved(
                assertedDispute.disputeId,
                assertedDispute.assertedOutcome,
                0, // plaintiffPayout - calculated in _distributePayouts
                0, // defendantPayout - calculated in _distributePayouts
                arbitratorReward
            );
        } else {
            // Reset dispute status if assertion was false
            dispute.status = DisputeStatus.Pending;
            dispute.outcome = DisputeOutcome.None;
            dispute.arbitrator = address(0);
        }
        
        delete assertedDisputes[assertionId];
    }

    /**
     * @dev UMA callback for disputed assertions
     * @param assertionId ID of the assertion
     */
    function assertionDisputedCallback(bytes32 assertionId) external override {
        // Handle dispute escalation if needed
        // For now, just log the dispute
    }

    /**
     * @dev Withdraw accumulated rewards for arbitrators
     */
    function withdrawRewards() external nonReentrant {
        uint256 amount = arbitratorRewards[msg.sender];
        require(amount > 0, "No rewards to withdraw");
        
        arbitratorRewards[msg.sender] = 0;
        currency.safeTransfer(msg.sender, amount);
        
        emit RewardWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Authorize an arbitrator (owner only)
     * @param arbitrator Address of the arbitrator to authorize
     */
    function authorizeArbitrator(address arbitrator) external onlyOwner {
        require(arbitrator != address(0), "Invalid arbitrator address");
        authorizedArbitrators[arbitrator] = true;
        emit ArbitratorAuthorized(arbitrator);
    }

    /**
     * @dev Deauthorize an arbitrator (owner only)
     * @param arbitrator Address of the arbitrator to deauthorize
     */
    function deauthorizeArbitrator(address arbitrator) external onlyOwner {
        authorizedArbitrators[arbitrator] = false;
        emit ArbitratorDeauthorized(arbitrator);
    }

    /**
     * @dev Get dispute details
     * @param disputeId ID of the dispute
     * @return Dispute struct
     */
    function getDispute(bytes32 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    /**
     * @dev Check if address is an authorized arbitrator
     * @param arbitrator Address to check
     * @return True if authorized
     */
    function isAuthorizedArbitrator(address arbitrator) external view returns (bool) {
        return authorizedArbitrators[arbitrator];
    }

    /**
     * @dev Get pending rewards for an arbitrator
     * @param arbitrator Address of the arbitrator
     * @return Amount of pending rewards
     */
    function getArbitratorRewards(address arbitrator) external view returns (uint256) {
        return arbitratorRewards[arbitrator];
    }

    // Internal functions

    /**
     * @dev Distribute payouts based on dispute outcome
     * @param disputeId ID of the dispute
     * @param outcome Final outcome of the dispute
     */
    function _distributePayouts(bytes32 disputeId, DisputeOutcome outcome) internal {
        Dispute storage dispute = disputes[disputeId];
        uint256 totalReward = dispute.reward;
        uint256 arbitratorFee = (totalReward * ARBITRATOR_FEE_PERCENTAGE) / 100;
        uint256 remainingReward = totalReward - arbitratorFee;

        if (outcome == DisputeOutcome.PlaintiffWins) {
            // Plaintiff gets 80% of remaining reward, defendant gets 20%
            uint256 plaintiffPayout = (remainingReward * 80) / 100;
            uint256 defendantPayout = remainingReward - plaintiffPayout;
            
            currency.safeTransfer(dispute.plaintiff, plaintiffPayout);
            currency.safeTransfer(dispute.defendant, defendantPayout);
        } else if (outcome == DisputeOutcome.DefendantWins) {
            // Defendant gets 80% of remaining reward, plaintiff gets 20%
            uint256 defendantPayout = (remainingReward * 80) / 100;
            uint256 plaintiffPayout = remainingReward - defendantPayout;
            
            currency.safeTransfer(dispute.defendant, defendantPayout);
            currency.safeTransfer(dispute.plaintiff, plaintiffPayout);
        } else if (outcome == DisputeOutcome.Split) {
            // Split remaining reward equally
            uint256 splitAmount = remainingReward / 2;
            currency.safeTransfer(dispute.plaintiff, splitAmount);
            currency.safeTransfer(dispute.defendant, splitAmount);
        } else {
            // Invalid outcome - return rewards to plaintiff
            currency.safeTransfer(dispute.plaintiff, remainingReward);
        }
    }

    /**
     * @dev Compose claim for UMA assertion
     * @param dispute Dispute struct
     * @param outcome Asserted outcome
     * @return Composed claim bytes
     */
    function _composeIPDisputeClaim(
        Dispute memory dispute,
        DisputeOutcome outcome
    ) internal view returns (bytes memory) {
        string memory outcomeString;
        if (outcome == DisputeOutcome.PlaintiffWins) {
            outcomeString = "Plaintiff Wins";
        } else if (outcome == DisputeOutcome.DefendantWins) {
            outcomeString = "Defendant Wins";
        } else if (outcome == DisputeOutcome.Split) {
            outcomeString = "Split Decision";
        } else {
            outcomeString = "Invalid";
        }

        return abi.encodePacked(
            "As of assertion timestamp ",
            ClaimData.toUtf8BytesUint(block.timestamp),
            ", the IP dispute outcome is: ",
            outcomeString,
            ". Dispute ID: ",
            _bytes32ToString(dispute.disputeId),
            ". Description: ",
            dispute.description,
            ". Evidence: ",
            dispute.evidence
        );
    }

    /**
     * @dev Get collateral whitelist from UMA finder
     * @return AddressWhitelist contract
     */
    function _getCollateralWhitelist() internal view returns (AddressWhitelist) {
        return AddressWhitelist(finder.getImplementationAddress(OracleInterfaces.CollateralWhitelist));
    }

    /**
     * @dev Make assertion to UMA with default parameters
     * @param claim Claim to assert
     * @param bond Bond amount
     * @return Assertion ID
     */
    function _assertTruthWithDefaults(
        bytes memory claim,
        uint256 bond
    ) internal returns (bytes32) {
        return oo.assertTruth(
            claim,
            msg.sender, // Asserter
            address(this), // Receive callback in this contract
            address(0), // No sovereign security
            assertionLiveness,
            currency,
            bond,
            defaultIdentifier,
            bytes32(0) // No domain
        );
    }

    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        return _bytes32ToString(bytes32(uint256(uint160(addr))));
    }

    /**
     * @dev Convert bytes32 to string
     * @param data Bytes32 to convert
     * @return String representation
     */
    function _bytes32ToString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[2 * i] = alphabet[uint8(data[i] >> 4)];
            str[2 * i + 1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
} 