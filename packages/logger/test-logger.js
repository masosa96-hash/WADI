const logger = require("./index");

console.log("--- Logger Test Start ---");
logger.info({ context: "test" }, "Testing info log");
logger.warn("Testing warn log");
logger.error(new Error("Test error"), "Testing error log");
console.log("--- Logger Test End ---");
