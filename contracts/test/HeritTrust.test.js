const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HeritTrust", function () {
    let HeritTrust;
    let heritTrust;
    let owner, contractor, verifier, citizen;

    beforeEach(async function () {
        [owner, contractor, verifier, citizen] = await ethers.getSigners();
        HeritTrust = await ethers.getContractFactory("HeritTrust");
        heritTrust = await HeritTrust.deploy(); // Deploys with owner as DEFAULT_ADMIN_ROLE

        // Grant VERIFIER_ROLE to the verifier account
        const VERIFIER_ROLE = await heritTrust.VERIFIER_ROLE();
        await heritTrust.grantRole(VERIFIER_ROLE, verifier.address);
    });

    it("Should create a project and lock funds", async function () {
        const budget = ethers.parseEther("1.0");

        await expect(heritTrust.createProject(
            "Temple Restoration",
            "Restoring the ancient Shiva temple",
            contractor.address,
            budget,
            { value: budget }
        ))
            .to.emit(heritTrust, "ProjectCreated")
            .withArgs(1, "Temple Restoration", contractor.address, budget)
            .to.emit(heritTrust, "FundsLocked")
            .withArgs(1, budget);

        const project = await heritTrust.getProject(1);
        expect(project.fundsLocked).to.equal(budget);
        expect(project.contractor).to.equal(contractor.address);
    });

    it("Should allow admin to add milestones", async function () {
        const budget = ethers.parseEther("1.0");
        await heritTrust.createProject("Bridge Fix", "Fixing bridge", contractor.address, budget, { value: budget });

        await heritTrust.addMilestone(1, "Foundation Work", ethers.parseEther("0.3"));

        const milestone = await heritTrust.getMilestone(1, 1);
        expect(milestone.description).to.equal("Foundation Work");
        expect(milestone.amount).to.equal(ethers.parseEther("0.3"));
        expect(milestone.status).to.equal(0); // Pending
    });

    it("Should allow full flow: Create -> Milestone -> Submit -> Verify -> Approve -> Release", async function () {
        const budget = ethers.parseEther("2.0");
        const milestoneAmount = ethers.parseEther("1.0");

        // 1. Create Project
        await heritTrust.createProject("Road Paving", "Paving village road", contractor.address, budget, { value: budget });

        // 2. Add Milestone
        await heritTrust.addMilestone(1, "Phase 1 Completed", milestoneAmount);

        // 3. Contractor Submits Proof
        // Connect as contractor
        await heritTrust.connect(contractor).submitMilestoneProof(1, 1, "QmHashOfImage");
        let milestone = await heritTrust.getMilestone(1, 1);
        expect(milestone.status).to.equal(1); // Submitted
        expect(milestone.proofHash).to.equal("QmHashOfImage");

        // 4. Verifier Verifies (AI/Expert)
        // Connect as verifier
        await heritTrust.connect(verifier).verifyMilestone(1, 1, 95); // Score 95
        milestone = await heritTrust.getMilestone(1, 1);
        expect(milestone.status).to.equal(2); // Verified
        expect(milestone.verificationScore).to.equal(95);

        // 5. Admin Approves and Releases Funds
        const initialContractorBalance = await ethers.provider.getBalance(contractor.address);

        await expect(heritTrust.connect(owner).approveAndRelease(1, 1))
            .to.emit(heritTrust, "FundsReleased")
            .withArgs(1, 1, milestoneAmount, contractor.address);

        const finalContractorBalance = await ethers.provider.getBalance(contractor.address);
        expect(finalContractorBalance - initialContractorBalance).to.equal(milestoneAmount);

        milestone = await heritTrust.getMilestone(1, 1);
        expect(milestone.status).to.equal(3); // Approved

        const project = await heritTrust.getProject(1);
        expect(project.fundsReleased).to.equal(milestoneAmount);
        expect(project.fundsLocked).to.equal(budget - milestoneAmount);
    });

    it("Should prevent unauthorized fund release", async function () {
        const budget = ethers.parseEther("1.0");
        await heritTrust.createProject("Test", "Desc", contractor.address, budget, { value: budget });
        await heritTrust.addMilestone(1, "M1", ethers.parseEther("0.5"));

        // Try to release without verification
        await expect(heritTrust.approveAndRelease(1, 1)).to.be.revertedWith("Milestone not verified");
    });
});
