// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HeritTrust is AccessControl, ReentrancyGuard {
    bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE"); // AI Agent or Auditor

    enum ProjectStatus { Created, Active, Completed, Cancelled }
    enum MilestoneStatus { Pending, Submitted, Verified, Approved, Rejected }

    struct Milestone {
        uint256 id;
        string description;
        uint256 amount;
        MilestoneStatus status;
        string proofHash; // IPFS Hash
        uint256 verificationScore; // AI Score 0-100
    }

    struct Project {
        uint256 id;
        string name;
        string description;
        address contractor;
        uint256 totalBudget;
        uint256 fundsLocked;
        uint256 fundsReleased;
        ProjectStatus status;
        uint256 milestoneCount;
    }

    uint256 public projectCount;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    event ProjectCreated(uint256 indexed projectId, string name, address indexed contractor, uint256 totalBudget);
    event FundsLocked(uint256 indexed projectId, uint256 amount);
    event MilestoneDefined(uint256 indexed projectId, uint256 milestoneId, uint256 amount);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, string proofHash);
    event MilestoneVerified(uint256 indexed projectId, uint256 indexed milestoneId, uint256 score);
    event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, address indexed approver);
    event FundsReleased(uint256 indexed projectId, uint256 indexed milestoneId, uint256 amount, address indexed contractor);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Admin creates a project and locks funds
    function createProject(
        string memory _name,
        string memory _description,
        address _contractor,
        uint256 _totalBudget
    ) external payable onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(msg.value == _totalBudget, "Sent ETH must match budget");
        require(_contractor != address(0), "Invalid contractor address");

        projectCount++;
        projects[projectCount] = Project({
            id: projectCount,
            name: _name,
            description: _description,
            contractor: _contractor,
            totalBudget: _totalBudget,
            fundsLocked: msg.value,
            fundsReleased: 0,
            status: ProjectStatus.Created,
            milestoneCount: 0
        });

        _grantRole(CONTRACTOR_ROLE, _contractor);

        emit ProjectCreated(projectCount, _name, _contractor, _totalBudget);
        emit FundsLocked(projectCount, msg.value);
    }

    // Admin defines milestones for a project
    function addMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Created || project.status == ProjectStatus.Active, "Project not active");
        
        uint256 currentMilestoneTotal;
        for(uint256 i = 1; i <= project.milestoneCount; i++) {
            currentMilestoneTotal += milestones[_projectId][i].amount;
        }
        require(currentMilestoneTotal + _amount <= project.totalBudget, "Exceeds total budget");

        project.milestoneCount++;
        milestones[_projectId][project.milestoneCount] = Milestone({
            id: project.milestoneCount,
            description: _description,
            amount: _amount,
            status: MilestoneStatus.Pending,
            proofHash: "",
            verificationScore: 0
        });

        if(project.status == ProjectStatus.Created) {
            project.status = ProjectStatus.Active;
        }

        emit MilestoneDefined(_projectId, project.milestoneCount, _amount);
    }

    // Contractor uploads proof (IPFS Hash)
    function submitMilestoneProof(
        uint256 _projectId,
        uint256 _milestoneId,
        string memory _proofHash
    ) external onlyRole(CONTRACTOR_ROLE) {
        Project storage project = projects[_projectId];
        require(project.contractor == msg.sender, "Not the project contractor");
        
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.Pending || milestone.status == MilestoneStatus.Rejected, "Invalid status");

        milestone.proofHash = _proofHash;
        milestone.status = MilestoneStatus.Submitted;

        emit MilestoneSubmitted(_projectId, _milestoneId, _proofHash);
    }

    // AI Agent or Admin verifies the proof with a score
    function verifyMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        uint256 _score
    ) external {
        require(hasRole(VERIFIER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized to verify");
        
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.Submitted, "Milestone not submitted");

        milestone.verificationScore = _score;
        milestone.status = MilestoneStatus.Verified;

        emit MilestoneVerified(_projectId, _milestoneId, _score);
    }

    // Admin approves release of funds
    function approveAndRelease(
        uint256 _projectId,
        uint256 _milestoneId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.Verified, "Milestone not verified");

        Project storage project = projects[_projectId];
        require(address(this).balance >= milestone.amount, "Insufficient contract balance");

        milestone.status = MilestoneStatus.Approved;
        project.fundsReleased += milestone.amount;
        project.fundsLocked -= milestone.amount;

        (bool success, ) = payable(project.contractor).call{value: milestone.amount}("");
        require(success, "Transfer failed");

        if (project.fundsReleased == project.totalBudget) {
            project.status = ProjectStatus.Completed;
        }

        emit MilestoneApproved(_projectId, _milestoneId, msg.sender);
        emit FundsReleased(_projectId, _milestoneId, milestone.amount, project.contractor);
    }

    // View functions
    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }
    
    function getMilestone(uint256 _projectId, uint256 _milestoneId) external view returns (Milestone memory) {
        return milestones[_projectId][_milestoneId];
    }
}
