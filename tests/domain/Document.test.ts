import { describe, it, expect } from "@jest/globals";
import { Document } from "../../src/domain/entities/Document";

describe("Document", () => {
  describe("CPF validation", () => {
    it("should validate a valid CPF", () => {
      const validCPF = "12345678909";
      const validation = new Document(validCPF);
      expect(validation.isValid()).toBe(true);
    });

    it("should reject CPF with invalid verification digits", () => {
      const invalidCPF = "12345678900";
      const validation = new Document(invalidCPF);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CPF with wrong length", () => {
      const invalidCPF = "123456789";
      const validation = new Document(invalidCPF);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CPF with non-numeric characters", () => {
      const invalidCPF = "123.456.789-09";
      const validation = new Document(invalidCPF);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CPF with letters", () => {
      const invalidCPF = "1234567890a";
      const validation = new Document(invalidCPF);
      expect(validation.isValid()).toBe(false);
    });
  });

  describe("CNPJ validation", () => {
    it("should validate a valid CNPJ", () => {
      const validCNPJ = "12345678000195";
      const validation = new Document(validCNPJ);
      expect(validation.isValid()).toBe(true);
    });

    it("should reject CNPJ with invalid verification digits", () => {
      const invalidCNPJ = "12345678000100";
      const validation = new Document(invalidCNPJ);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CNPJ with wrong length", () => {
      const invalidCNPJ = "1234567800019";
      const validation = new Document(invalidCNPJ);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CNPJ with non-numeric characters", () => {
      const invalidCNPJ = "12.345.678/0001-95";
      const validation = new Document(invalidCNPJ);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject CNPJ with letters", () => {
      const invalidCNPJ = "1234567800019a";
      const validation = new Document(invalidCNPJ);
      expect(validation.isValid()).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should reject empty string", () => {
      const validation = new Document("");
      expect(validation.isValid()).toBe(false);
    });

    it("should reject null as document", () => {
      const validation = new Document(null as any);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject undefined as document", () => {
      const validation = new Document(undefined as any);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject document with length 12", () => {
      const invalidDocument = "123456789012";
      const validation = new Document(invalidDocument);
      expect(validation.isValid()).toBe(false);
    });

    it("should reject document with length 13", () => {
      const invalidDocument = "1234567890123";
      const validation = new Document(invalidDocument);
      expect(validation.isValid()).toBe(false);
    });
  });
});
