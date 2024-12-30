// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingProtocol is Ownable {
    struct Loan {
        uint256 collateralAmount;
        uint256 loanAmount;
        address collateralToken;
        address loanToken;
        address recipient;
        uint256 deadline;
        bool isRepaid;
    }

    mapping(address => Loan[]) public loans;

    event CollateralLocked(address indexed user, uint256 amount, address token);
    event LoanIssued(address indexed user, uint256 amount, address token);
    event LoanRepaid(
        address indexed user,
        uint256 amount,
        address token,
        address recipient
    );
    event CollateralReleased(address indexed user, uint256 amount, address token);

    uint256 public constant MAX_LOAN_DURATION = 30 days;

    constructor() Ownable(_msgSender()) {}

    function lockCollateralAndBorrow(
        uint256 collateralAmount,
        address collateralToken,
        uint256 loanAmount,
        address loanToken,
        address recipient,
        uint256 duration
    ) external {
        require(collateralAmount > 0, "Collateral amount must be greater than 0");
        require(loanAmount > 0, "Loan amount must be greater than 0");
        require(duration <= MAX_LOAN_DURATION, "Loan duration exceeds maximum limit");

        IERC20 collateral = IERC20(collateralToken);
        IERC20 loan = IERC20(loanToken);

        require(
            collateral.balanceOf(msg.sender) >= collateralAmount,
            "Insufficient collateral balance"
        );
        require(
            loan.balanceOf(address(this)) >= loanAmount,
            "Insufficient loan token liquidity"
        );

        collateral.transferFrom(msg.sender, address(this), collateralAmount);
        loan.transfer(msg.sender, loanAmount);

        loans[msg.sender].push(
            Loan({
                collateralAmount: collateralAmount,
                loanAmount: loanAmount,
                collateralToken: collateralToken,
                loanToken: loanToken,
                recipient: recipient,
                deadline: block.timestamp + duration,
                isRepaid: false
            })
        );

        emit CollateralLocked(msg.sender, collateralAmount, collateralToken);
        emit LoanIssued(msg.sender, loanAmount, loanToken);
    }

    function repayLoan(uint256 loanIndex) external {
        require(loanIndex < loans[msg.sender].length, "Invalid loan index");
        Loan storage userLoan = loans[msg.sender][loanIndex];
        require(!userLoan.isRepaid, "Loan already repaid");
        require(block.timestamp <= userLoan.deadline, "Loan repayment deadline passed");

        IERC20 loan = IERC20(userLoan.loanToken);
        IERC20 collateral = IERC20(userLoan.collateralToken);

        require(
            loan.balanceOf(msg.sender) >= userLoan.loanAmount,
            "Insufficient loan token balance"
        );

        loan.transferFrom(msg.sender, userLoan.recipient, userLoan.loanAmount);
        collateral.transfer(msg.sender, userLoan.collateralAmount);

        userLoan.isRepaid = true;

        emit LoanRepaid(
            msg.sender,
            userLoan.loanAmount,
            userLoan.loanToken,
            userLoan.recipient
        );
        emit CollateralReleased(
            msg.sender,
            userLoan.collateralAmount,
            userLoan.collateralToken
        );
    }

    function getLoans(address user) external view returns (Loan[] memory) {
        return loans[user];
    }

    function getLoanDetails(address user, uint256 loanIndex)
        external
        view
        returns (Loan memory)
    {
        require(loanIndex < loans[user].length, "Invalid loan index");
        return loans[user][loanIndex];
    }

    function getLoanCount(address user) external view returns (uint256) {
        return loans[user].length;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
