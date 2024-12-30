const readline = require("readline");

class LendingProtocol {
    constructor() {
        this.loans = {};
        this.MAX_LOAN_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    }

    lockCollateralAndBorrow(
        user,
        collateralAmount,
        collateralToken,
        loanAmount,
        loanToken,
        recipient,
        duration
    ) {
        if (collateralAmount <= 0 || loanAmount <= 0) {
            throw new Error("Collateral and loan amounts must be greater than 0");
        }

        if (duration > this.MAX_LOAN_DURATION) {
            throw new Error("Loan duration exceeds maximum allowed limit");
        }

        if (!this.loans[user]) {
            this.loans[user] = [];
        }

        const loan = {
            collateralAmount,
            collateralToken,
            loanAmount,
            loanToken,
            recipient,
            deadline: Date.now() + duration,
            isRepaid: false,
        };

        this.loans[user].push(loan);
        console.log(`Collateral locked and loan issued for user: ${user}`);
    }

    repayLoan(user, loanIndex, repaymentAmount) {
        const userLoans = this.loans[user];
        if (!userLoans || loanIndex >= userLoans.length) {
            throw new Error("Invalid loan index or no loans found for user");
        }

        const loan = userLoans[loanIndex];
        if (loan.isRepaid) {
            throw new Error("Loan already repaid");
        }

        if (Date.now() > loan.deadline) {
            throw new Error("Loan repayment deadline has passed");
        }

        if (repaymentAmount < loan.loanAmount) {
            throw new Error("Repayment amount is insufficient");
        }

        loan.isRepaid = true;
        console.log(
            `Loan repaid: ${loan.loanAmount} ${loan.loanToken} sent to ${loan.recipient}`
        );
        console.log(
            `Collateral of ${loan.collateralAmount} ${loan.collateralToken} released to user`
        );
    }

    getLoans(user) {
        return this.loans[user] || [];
    }

    getLoanDetails(user, loanIndex) {
        const userLoans = this.loans[user];
        if (!userLoans || loanIndex >= userLoans.length) {
            throw new Error("Invalid loan index or no loans found for user");
        }

        return userLoans[loanIndex];
    }
}

const protocol = new LendingProtocol();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function promptUser() {
    console.log("\n=== Lending Protocol ===");
    console.log("1. Lock Collateral and Borrow");
    console.log("2. Repay Loan");
    console.log("3. View All Loans");
    console.log("4. View Loan Details");
    console.log("5. Exit");
    rl.question("Choose an option: ", (choice) => {
        switch (choice) {
            case "1":
                lockCollateralAndBorrowCLI();
                break;
            case "2":
                repayLoanCLI();
                break;
            case "3":
                viewAllLoansCLI();
                break;
            case "4":
                viewLoanDetailsCLI();
                break;
            case "5":
                console.log("Exiting...");
                rl.close();
                break;
            default:
                console.log("Invalid choice. Please try again.");
                promptUser();
        }
    });
}

function lockCollateralAndBorrowCLI() {
    rl.question("Enter your username: ", (user) => {
        rl.question("Enter collateral amount: ", (collateralAmount) => {
            rl.question("Enter collateral token (e.g., ETH): ", (collateralToken) => {
                rl.question("Enter loan amount: ", (loanAmount) => {
                    rl.question("Enter loan token (e.g., USDC): ", (loanToken) => {
                        rl.question("Enter recipient username: ", (recipient) => {
                            rl.question("Enter loan duration in days: ", (durationDays) => {
                                try {
                                    const durationMs =
                                        parseInt(durationDays) * 24 * 60 * 60 * 1000;
                                    protocol.lockCollateralAndBorrow(
                                        user,
                                        parseFloat(collateralAmount),
                                        collateralToken,
                                        parseFloat(loanAmount),
                                        loanToken,
                                        recipient,
                                        durationMs
                                    );
                                } catch (error) {
                                    console.error("Error:", error.message);
                                }
                                promptUser();
                            });
                        });
                    });
                });
            });
        });
    });
}

function repayLoanCLI() {
    rl.question("Enter your username: ", (user) => {
        rl.question("Enter loan index: ", (loanIndex) => {
            rl.question("Enter repayment amount: ", (repaymentAmount) => {
                try {
                    protocol.repayLoan(
                        user,
                        parseInt(loanIndex),
                        parseFloat(repaymentAmount)
                    );
                } catch (error) {
                    console.error("Error:", error.message);
                }
                promptUser();
            });
        });
    });
}

function viewAllLoansCLI() {
    rl.question("Enter your username: ", (user) => {
        const loans = protocol.getLoans(user);
        if (loans.length === 0) {
            console.log("No loans found.");
        } else {
            console.log("Your Loans:", loans);
        }
        promptUser();
    });
}

function viewLoanDetailsCLI() {
    rl.question("Enter your username: ", (user) => {
        rl.question("Enter loan index: ", (loanIndex) => {
            try {
                const loan = protocol.getLoanDetails(user, parseInt(loanIndex));
                console.log("Loan Details:", loan);
            } catch (error) {
                console.error("Error:", error.message);
            }
            promptUser();
        });
    });
}

// Start the CLI
promptUser();
