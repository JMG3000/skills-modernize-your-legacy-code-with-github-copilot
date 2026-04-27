"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { DataProgram, Operations } = require("../index");

function createAsk(answers) {
  let index = 0;
  return async () => {
    const value = answers[index] ?? "";
    index += 1;
    return value;
  };
}

async function captureLogs(work) {
  const logs = [];
  const originalLog = console.log;

  console.log = (...args) => {
    logs.push(args.join(" "));
  };

  try {
    await work();
  } finally {
    console.log = originalLog;
  }

  return logs;
}

test("DataProgram READ returns initial balance 1000.00", () => {
  const dataProgram = new DataProgram();
  const balance = dataProgram.execute("READ", 0);

  assert.equal(balance, 1000);
});

test("DataProgram WRITE persists the new balance", () => {
  const dataProgram = new DataProgram();
  dataProgram.execute("WRITE", 1450.5);

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1450.5);
});

test("TOTAL operation is read-only and prints current balance", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk([]));

  const before = dataProgram.execute("READ", 0);
  const logs = await captureLogs(async () => {
    await operations.run("TOTAL ");
  });
  const after = dataProgram.execute("READ", 0);

  assert.equal(before, 1000);
  assert.equal(after, 1000);
  assert.match(logs.join("\n"), /Current balance: 1000\.00/);
});

test("CREDIT operation increases balance", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["200.00"]));

  await operations.run("CREDIT");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1200);
});

test("Multiple CREDIT operations are cumulative", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["100.00", "50.00"]));

  await operations.run("CREDIT");
  await operations.run("CREDIT");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1150);
});

test("DEBIT operation decreases balance when funds are sufficient", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["250.00"]));

  await operations.run("DEBIT ");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 750);
});

test("DEBIT allows amount equal to current balance", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["1000.00"]));

  await operations.run("DEBIT ");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 0);
});

test("DEBIT is rejected when funds are insufficient", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["1000.01"]));

  const logs = await captureLogs(async () => {
    await operations.run("DEBIT ");
  });

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1000);
  assert.match(logs.join("\n"), /Insufficient funds for this debit\./);
});

test("Rejected DEBIT does not affect future valid CREDIT", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["1500.00", "200.00"]));

  await operations.run("DEBIT ");
  await operations.run("CREDIT");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1200);
});

test("Zero CREDIT leaves balance unchanged", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["0.00"]));

  await operations.run("CREDIT");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1000);
});

test("Zero DEBIT leaves balance unchanged", async () => {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, createAsk(["0.00"]));

  await operations.run("DEBIT ");

  const balance = dataProgram.execute("READ", 0);
  assert.equal(balance, 1000);
});

