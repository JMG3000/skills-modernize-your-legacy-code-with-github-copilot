"use strict";

const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

class DataProgram {
  constructor(initialBalance = 1000.0) {
    this.storageBalance = initialBalance;
  }

  execute(operationType, balance) {
    if (operationType === "READ") {
      return this.storageBalance;
    }

    if (operationType === "WRITE") {
      this.storageBalance = balance;
      return this.storageBalance;
    }

    return balance;
  }
}

class Operations {
  constructor(dataProgram, ask) {
    this.dataProgram = dataProgram;
    this.ask = ask;
  }

  async run(passedOperation) {
    const operationType = passedOperation;
    let finalBalance = 1000.0;

    if (operationType === "TOTAL ") {
      finalBalance = this.dataProgram.execute("READ", finalBalance);
      console.log(`Current balance: ${finalBalance.toFixed(2)}`);
      return;
    }

    if (operationType === "CREDIT") {
      const amountInput = await this.ask("Enter credit amount: ");
      const amount = Number.parseFloat(amountInput);
      finalBalance = this.dataProgram.execute("READ", finalBalance);
      finalBalance += Number.isNaN(amount) ? 0 : amount;
      this.dataProgram.execute("WRITE", finalBalance);
      console.log(`Amount credited. New balance: ${finalBalance.toFixed(2)}`);
      return;
    }

    if (operationType === "DEBIT ") {
      const amountInput = await this.ask("Enter debit amount: ");
      const amount = Number.parseFloat(amountInput);
      finalBalance = this.dataProgram.execute("READ", finalBalance);
      const safeAmount = Number.isNaN(amount) ? 0 : amount;

      if (finalBalance >= safeAmount) {
        finalBalance -= safeAmount;
        this.dataProgram.execute("WRITE", finalBalance);
        console.log(`Amount debited. New balance: ${finalBalance.toFixed(2)}`);
      } else {
        console.log("Insufficient funds for this debit.");
      }
    }
  }
}

async function runApp() {
  const rl = readline.createInterface({ input, output });
  const ask = async (question) => {
    const answer = await rl.question(question);
    return answer.trim();
  };

  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, ask);

  let continueFlag = "YES";

  try {
    while (continueFlag !== "NO") {
      console.log("--------------------------------");
      console.log("Account Management System");
      console.log("1. View Balance");
      console.log("2. Credit Account");
      console.log("3. Debit Account");
      console.log("4. Exit");
      console.log("--------------------------------");

      const userChoice = Number.parseInt(await ask("Enter your choice (1-4): "), 10);

      switch (userChoice) {
        case 1:
          await operations.run("TOTAL ");
          break;
        case 2:
          await operations.run("CREDIT");
          break;
        case 3:
          await operations.run("DEBIT ");
          break;
        case 4:
          continueFlag = "NO";
          break;
        default:
          console.log("Invalid choice, please select 1-4.");
          break;
      }
    }
  } finally {
    rl.close();
  }

  console.log("Exiting the program. Goodbye!");
}

if (require.main === module) {
  runApp().catch((error) => {
    console.error("Application error:", error);
    process.exitCode = 1;
  });
}

module.exports = {
  DataProgram,
  Operations,
  runApp,
};
