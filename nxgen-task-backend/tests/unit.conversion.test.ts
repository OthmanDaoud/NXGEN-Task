import { parseDate, parseNumber } from "../src/utils/conversion.js";

describe("unit: conversion utils", () => {
  it("parseNumber returns undefined for invalid input", () => {
    expect(parseNumber("not-a-number")).toBeUndefined();
  });

  it("parseDate returns undefined for invalid input", () => {
    expect(parseDate("invalid-date")).toBeUndefined();
  });
});
