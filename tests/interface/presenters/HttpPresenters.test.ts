import { describe, it, expect } from "@jest/globals";
import { HttpPresenters } from "../../../src/interface/presenters/HttpPresenters";

describe("HttpPresenters", () => {
  describe("ok", () => {
    it("should return status 200 with data", () => {
      const data = { id: "1", name: "Test" };
      const result = HttpPresenters.ok(data);
      expect(result).toEqual({ status: 200, data });
    });

    it("should return status 200 with null data", () => {
      const result = HttpPresenters.ok(null);
      expect(result).toEqual({ status: 200, data: null });
    });

    it("should return status 200 with array data", () => {
      const data = [1, 2, 3];
      const result = HttpPresenters.ok(data);
      expect(result).toEqual({ status: 200, data });
    });
  });

  describe("created", () => {
    it("should return status 201 with data", () => {
      const data = { id: "1", name: "New Resource" };
      const result = HttpPresenters.created(data);
      expect(result).toEqual({ status: 201, data });
    });
  });

  describe("noContent", () => {
    it("should return status 204 with no data", () => {
      const result = HttpPresenters.noContent();
      expect(result).toEqual({ status: 204 });
    });

    it("should return only status 204 regardless of input", () => {
      const result = HttpPresenters.noContent();
      expect(result).toEqual({ status: 204 });
      expect(result).not.toHaveProperty("data");
    });
  });

  describe("badRequest", () => {
    it("should return status 400 with error message", () => {
      const message = "Name is required";
      const result = HttpPresenters.badRequest(message);
      expect(result).toEqual({ status: 400, error: message });
    });
  });

  describe("unauthorized", () => {
    it("should return status 401 with error message", () => {
      const message = "No token provided";
      const result = HttpPresenters.unauthorized(message);
      expect(result).toEqual({ status: 401, error: message });
    });
  });

  describe("forbidden", () => {
    it("should return status 403 with error message", () => {
      const message = "Access denied. Admin role required.";
      const result = HttpPresenters.forbidden(message);
      expect(result).toEqual({ status: 403, error: message });
    });
  });

  describe("notFound", () => {
    it("should return status 404 with error message", () => {
      const message = "Resource not found";
      const result = HttpPresenters.notFound(message);
      expect(result).toEqual({ status: 404, error: message });
    });
  });

  describe("internalServerError", () => {
    it("should return status 500 with a generic error message", () => {
      const result = HttpPresenters.internalServerError();
      expect(result).toEqual({ status: 500, error: "Internal server error" });
    });
  });
});
