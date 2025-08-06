import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";

describe("IPArbitration", function () {
  let IPArbitration: ContractFactory;
  let ipArbitration: Contract;
  let MockERC20: ContractFactory;
  let mockCurrency: Contract;
  let MockUMAFinder: ContractFactory;
  let mockFinder: Contract;
  let MockOptimisticOracle: ContractFactory;
  let mockOO: Contract;
  
  let owner: Signer;
  let plaintiff: Signer;
  let defendant: Signer;
  let arbitrator: Signer;
  let otherAccount: Signer;
  
  let ownerAddress: string;
  let plaintiffAddress: string;
  let defendantAddress: string;
  let arbitratorAddress: string;
  let otherAddress: string;

  const MINIMUM_REWARD = ethers.parseEther("100");
  const MINIMUM_BOND = ethers.parseEther("50");
  const EVIDENCE_PERIOD = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, plaintiff, defendant, arbitrator, otherAccount] = await ethers.getSigners();
    
    ownerAddress = await owner.getAddress();
    plaintiffAddress = await plaintiff.getAddress();
    defendantAddress = await defendant.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    otherAddress = await otherAccount.getAddress();

    // Deploy mock contracts
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockCurrency = await MockERC20.deploy("Mock Token", "MTK");
    
    MockUMAFinder = await ethers.getContractFactory("MockUMAFinder");
    mockFinder = await MockUMAFinder.deploy();
    
    MockOptimisticOracle = await ethers.getContractFactory("MockOptimisticOracle");
    mockOO = await MockOptimisticOracle.deploy();

    // Deploy IP Arbitration contract
    IPArbitration = await ethers.getContractFactory("IPArbitration");
    ipArbitration = await IPArbitration.deploy(
      await mockFinder.getAddress(),
      await mockCurrency.getAddress(),
      await mockOO.getAddress()
    );

    // Setup mock currency for testing
    await mockCurrency.mint(plaintiffAddress, ethers.parseEther("1000"));
    await mockCurrency.mint(arbitratorAddress, ethers.parseEther("1000"));
    
    // Authorize arbitrator
    await ipArbitration.connect(owner).authorizeArbitrator(arbitratorAddress);
  });

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await ipArbitration.finder()).to.equal(await mockFinder.getAddress());
      expect(await ipArbitration.currency()).to.equal(await mockCurrency.getAddress());
      expect(await ipArbitration.oo()).to.equal(await mockOO.getAddress());
    });

    it("Should have correct constants", async function () {
      expect(await ipArbitration.MINIMUM_REWARD()).to.equal(MINIMUM_REWARD);
      expect(await ipArbitration.MINIMUM_BOND()).to.equal(MINIMUM_BOND);
      expect(await ipArbitration.EVIDENCE_PERIOD()).to.equal(EVIDENCE_PERIOD);
      expect(await ipArbitration.ARBITRATOR_FEE_PERCENTAGE()).to.equal(10);
    });
  });

  describe("Arbitrator Management", function () {
    it("Should allow owner to authorize arbitrator", async function () {
      await ipArbitration.connect(owner).authorizeArbitrator(otherAddress);
      expect(await ipArbitration.isAuthorizedArbitrator(otherAddress)).to.be.true;
    });

    it("Should allow owner to deauthorize arbitrator", async function () {
      await ipArbitration.connect(owner).deauthorizeArbitrator(arbitratorAddress);
      expect(await ipArbitration.isAuthorizedArbitrator(arbitratorAddress)).to.be.false;
    });

    it("Should not allow non-owner to authorize arbitrator", async function () {
      await expect(
        ipArbitration.connect(plaintiff).authorizeArbitrator(otherAddress)
      ).to.be.revertedWithCustomError(ipArbitration, "OwnableUnauthorizedAccount");
    });
  });

  describe("Dispute Creation", function () {
    const mockIPAssetContract = "0x1234567890123456789012345678901234567890";
    const mockTokenId = 1;
    const mockLicenseId = 1;
    const description = "Test dispute description";
    const reward = ethers.parseEther("200");
    const requiredBond = ethers.parseEther("100");

    beforeEach(async function () {
      await mockCurrency.connect(plaintiff).approve(await ipArbitration.getAddress(), reward);
    });

    it("Should create dispute successfully", async function () {
      const tx = await ipArbitration.connect(plaintiff).createDispute(
        defendantAddress,
        mockIPAssetContract,
        mockTokenId,
        mockLicenseId,
        description,
        reward,
        requiredBond
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DisputeCreated"
      );

      expect(event).to.not.be.undefined;
      
      const disputeId = event?.args[0];
      const dispute = await ipArbitration.getDispute(disputeId);
      
      expect(dispute.plaintiff).to.equal(plaintiffAddress);
      expect(dispute.defendant).to.equal(defendantAddress);
      expect(dispute.ipAssetContract).to.equal(mockIPAssetContract);
      expect(dispute.ipAssetTokenId).to.equal(mockTokenId);
      expect(dispute.licenseId).to.equal(mockLicenseId);
      expect(dispute.description).to.equal(description);
      expect(dispute.reward).to.equal(reward);
      expect(dispute.requiredBond).to.equal(requiredBond);
      expect(dispute.status).to.equal(0); // Pending
    });

    it("Should fail with invalid defendant address", async function () {
      await expect(
        ipArbitration.connect(plaintiff).createDispute(
          ethers.ZeroAddress,
          mockIPAssetContract,
          mockTokenId,
          mockLicenseId,
          description,
          reward,
          requiredBond
        )
      ).to.be.revertedWith("Invalid defendant address");
    });

    it("Should fail with empty description", async function () {
      await expect(
        ipArbitration.connect(plaintiff).createDispute(
          defendantAddress,
          mockIPAssetContract,
          mockTokenId,
          mockLicenseId,
          "",
          reward,
          requiredBond
        )
      ).to.be.revertedWith("Empty description");
    });

    it("Should fail with reward too low", async function () {
      await expect(
        ipArbitration.connect(plaintiff).createDispute(
          defendantAddress,
          mockIPAssetContract,
          mockTokenId,
          mockLicenseId,
          description,
          ethers.parseEther("50"), // Below minimum
          requiredBond
        )
      ).to.be.revertedWith("Reward too low");
    });

    it("Should fail with bond too low", async function () {
      await expect(
        ipArbitration.connect(plaintiff).createDispute(
          defendantAddress,
          mockIPAssetContract,
          mockTokenId,
          mockLicenseId,
          description,
          reward,
          ethers.parseEther("25") // Below minimum
        )
      ).to.be.revertedWith("Bond too low");
    });

    it("Should fail when disputing yourself", async function () {
      await expect(
        ipArbitration.connect(plaintiff).createDispute(
          plaintiffAddress,
          mockIPAssetContract,
          mockTokenId,
          mockLicenseId,
          description,
          reward,
          requiredBond
        )
      ).to.be.revertedWith("Cannot dispute yourself");
    });
  });

  describe("Evidence Submission", function () {
    let disputeId: string;

    beforeEach(async function () {
      // Create a dispute first
      await mockCurrency.connect(plaintiff).approve(await ipArbitration.getAddress(), MINIMUM_REWARD);
      
      const tx = await ipArbitration.connect(plaintiff).createDispute(
        defendantAddress,
        "0x1234567890123456789012345678901234567890",
        1,
        1,
        "Test dispute",
        MINIMUM_REWARD,
        MINIMUM_BOND
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DisputeCreated"
      );
      disputeId = event?.args[0];
    });

    it("Should allow plaintiff to submit evidence", async function () {
      const evidence = "This is evidence from the plaintiff";
      
      await expect(
        ipArbitration.connect(plaintiff).submitEvidence(disputeId, evidence)
      ).to.emit(ipArbitration, "EvidenceSubmitted")
        .withArgs(disputeId, plaintiffAddress, evidence);
    });

    it("Should allow defendant to submit evidence", async function () {
      const evidence = "This is evidence from the defendant";
      
      await expect(
        ipArbitration.connect(defendant).submitEvidence(disputeId, evidence)
      ).to.emit(ipArbitration, "EvidenceSubmitted")
        .withArgs(disputeId, defendantAddress, evidence);
    });

    it("Should not allow non-party to submit evidence", async function () {
      const evidence = "This is evidence from a third party";
      
      await expect(
        ipArbitration.connect(otherAccount).submitEvidence(disputeId, evidence)
      ).to.be.revertedWith("Not a party to this dispute");
    });

    it("Should not allow empty evidence", async function () {
      await expect(
        ipArbitration.connect(plaintiff).submitEvidence(disputeId, "")
      ).to.be.revertedWith("Empty evidence");
    });
  });

  describe("Arbitration", function () {
    let disputeId: string;

    beforeEach(async function () {
      // Create a dispute and advance time past evidence period
      await mockCurrency.connect(plaintiff).approve(await ipArbitration.getAddress(), MINIMUM_REWARD);
      
      const tx = await ipArbitration.connect(plaintiff).createDispute(
        defendantAddress,
        "0x1234567890123456789012345678901234567890",
        1,
        1,
        "Test dispute",
        MINIMUM_REWARD,
        MINIMUM_BOND
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DisputeCreated"
      );
      disputeId = event?.args[0];

      // Advance time past evidence period
      await ethers.provider.send("evm_increaseTime", [EVIDENCE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      // Setup arbitrator with currency
      await mockCurrency.connect(arbitrator).approve(await ipArbitration.getAddress(), MINIMUM_BOND);
    });

    it("Should allow authorized arbitrator to arbitrate", async function () {
      await expect(
        ipArbitration.connect(arbitrator).arbitrateDispute(disputeId, 1) // PlaintiffWins
      ).to.emit(ipArbitration, "DisputeArbitrated");
    });

    it("Should not allow unauthorized arbitrator to arbitrate", async function () {
      await expect(
        ipArbitration.connect(otherAccount).arbitrateDispute(disputeId, 1)
      ).to.be.revertedWith("Not authorized arbitrator");
    });

    it("Should not allow arbitration before evidence period ends", async function () {
      // Create new dispute
      const tx2 = await ipArbitration.connect(plaintiff).createDispute(
        defendantAddress,
        "0x1234567890123456789012345678901234567890",
        2,
        2,
        "Test dispute 2",
        MINIMUM_REWARD,
        MINIMUM_BOND
      );

      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find(
        (log: any) => log.fragment?.name === "DisputeCreated"
      );
      const disputeId2 = event2?.args[0];

      await expect(
        ipArbitration.connect(arbitrator).arbitrateDispute(disputeId2, 1)
      ).to.be.revertedWith("Evidence period not ended");
    });

    it("Should not allow invalid outcome", async function () {
      await expect(
        ipArbitration.connect(arbitrator).arbitrateDispute(disputeId, 0) // None
      ).to.be.revertedWith("Invalid outcome");
    });
  });

  describe("Payout Distribution", function () {
    let disputeId: string;
    const reward = ethers.parseEther("200");

    beforeEach(async function () {
      // Create a dispute
      await mockCurrency.connect(plaintiff).approve(await ipArbitration.getAddress(), reward);
      
      const tx = await ipArbitration.connect(plaintiff).createDispute(
        defendantAddress,
        "0x1234567890123456789012345678901234567890",
        1,
        1,
        "Test dispute",
        reward,
        MINIMUM_BOND
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DisputeCreated"
      );
      disputeId = event?.args[0];

      // Advance time and arbitrate
      await ethers.provider.send("evm_increaseTime", [EVIDENCE_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await mockCurrency.connect(arbitrator).approve(await ipArbitration.getAddress(), MINIMUM_BOND);
      await ipArbitration.connect(arbitrator).arbitrateDispute(disputeId, 1); // PlaintiffWins
    });

    it("Should distribute payouts correctly for plaintiff win", async function () {
      const plaintiffBalanceBefore = await mockCurrency.balanceOf(plaintiffAddress);
      const defendantBalanceBefore = await mockCurrency.balanceOf(defendantAddress);
      const arbitratorBalanceBefore = await mockCurrency.balanceOf(arbitratorAddress);

      // Simulate UMA callback
      await mockOO.simulateAssertionResolved(disputeId, true);

      const plaintiffBalanceAfter = await mockCurrency.balanceOf(plaintiffAddress);
      const defendantBalanceAfter = await mockCurrency.balanceOf(defendantAddress);
      const arbitratorBalanceAfter = await mockCurrency.balanceOf(arbitratorAddress);

      // Plaintiff should get 80% of remaining reward (after 10% arbitrator fee)
      const expectedPlaintiffPayout = (reward * 80n * 90n) / 10000n; // 80% of 90%
      const expectedDefendantPayout = (reward * 20n * 90n) / 10000n; // 20% of 90%
      const expectedArbitratorReward = (reward * 10n) / 100n; // 10%

      expect(plaintiffBalanceAfter - plaintiffBalanceBefore).to.equal(expectedPlaintiffPayout);
      expect(defendantBalanceAfter - defendantBalanceBefore).to.equal(expectedDefendantPayout);
      expect(arbitratorBalanceAfter - arbitratorBalanceBefore).to.equal(expectedArbitratorReward);
    });
  });

  describe("Reward Withdrawal", function () {
    it("Should allow arbitrator to withdraw rewards", async function () {
      // First, give some rewards to arbitrator
      await ipArbitration.connect(owner).authorizeArbitrator(arbitratorAddress);
      
      // Simulate some rewards
      await mockCurrency.mint(await ipArbitration.getAddress(), ethers.parseEther("100"));
      await ipArbitration.connect(owner).authorizeArbitrator(arbitratorAddress);
      
      const balanceBefore = await mockCurrency.balanceOf(arbitratorAddress);
      
      await expect(
        ipArbitration.connect(arbitrator).withdrawRewards()
      ).to.emit(ipArbitration, "RewardWithdrawn");
      
      const balanceAfter = await mockCurrency.balanceOf(arbitratorAddress);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should not allow withdrawal when no rewards", async function () {
      await expect(
        ipArbitration.connect(otherAccount).withdrawRewards()
      ).to.be.revertedWith("No rewards to withdraw");
    });
  });
});

// Mock contracts for testing
describe("Mock Contracts", function () {
  it("Should deploy mock ERC20", async function () {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mock Token", "MTK");
    
    expect(await mockToken.name()).to.equal("Mock Token");
    expect(await mockToken.symbol()).to.equal("MTK");
  });

  it("Should deploy mock UMA Finder", async function () {
    const MockUMAFinder = await ethers.getContractFactory("MockUMAFinder");
    const mockFinder = await MockUMAFinder.deploy();
    
    expect(await mockFinder.getAddress()).to.not.equal(ethers.ZeroAddress);
  });

  it("Should deploy mock Optimistic Oracle", async function () {
    const MockOptimisticOracle = await ethers.getContractFactory("MockOptimisticOracle");
    const mockOO = await MockOptimisticOracle.deploy();
    
    expect(await mockOO.getAddress()).to.not.equal(ethers.ZeroAddress);
  });
}); 