import { describe, it, expect, beforeEach } from "@jest/globals";
import { PartUseCase } from "../../../../src/application/use-cases/part/PartUseCase";
import { CreatePartUseCase } from "../../../../src/application/use-cases/part/methods/CreatePartUseCase";
import { DeletePartUseCase } from "../../../../src/application/use-cases/part/methods/DeletePartUseCase";
import { GetAllPartsUseCase } from "../../../../src/application/use-cases/part/methods/GetAllPartsUseCase";
import { GetPartByIdUseCase } from "../../../../src/application/use-cases/part/methods/GetPartByIdUseCase";
import { GetPartByPartNumberUseCase } from "../../../../src/application/use-cases/part/methods/GetPartByPartNumberUseCase";
import { UpdatePartUseCase } from "../../../../src/application/use-cases/part/methods/UpdatePartUseCase";
import type { IPartRepository } from "../../../../src/domain/repositories/IPartRepository";

describe("PartUseCase", () => {
  let partUseCase: PartUseCase;
  let mockPartRepository: jest.Mocked<IPartRepository>;

  beforeEach(() => {
    mockPartRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByPartNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    partUseCase = new PartUseCase(mockPartRepository);
  });

  describe("constructor", () => {
    it("should initialize all use cases", () => {
      expect(partUseCase.create).toBeInstanceOf(CreatePartUseCase);
      expect(partUseCase.delete).toBeInstanceOf(DeletePartUseCase);
      expect(partUseCase.getAll).toBeInstanceOf(GetAllPartsUseCase);
      expect(partUseCase.getById).toBeInstanceOf(GetPartByIdUseCase);
      expect(partUseCase.getByPartNumber).toBeInstanceOf(
        GetPartByPartNumberUseCase
      );
      expect(partUseCase.update).toBeInstanceOf(UpdatePartUseCase);
    });
  });

  describe("buildCreatePartUseCase", () => {
    it("should create and return CreatePartUseCase instance", () => {
      const createUseCase = partUseCase["buildCreatePartUseCase"]();
      expect(createUseCase).toBeInstanceOf(CreatePartUseCase);
    });
  });

  describe("buildDeletePartUseCase", () => {
    it("should create and return DeletePartUseCase instance", () => {
      const deleteUseCase = partUseCase["buildDeletePartUseCase"]();
      expect(deleteUseCase).toBeInstanceOf(DeletePartUseCase);
    });
  });

  describe("buildGetAllPartsUseCase", () => {
    it("should create and return GetAllPartsUseCase instance", () => {
      const getAllUseCase = partUseCase["buildGetAllPartsUseCase"]();
      expect(getAllUseCase).toBeInstanceOf(GetAllPartsUseCase);
    });
  });

  describe("buildGetPartByIdUseCase", () => {
    it("should create and return GetPartByIdUseCase instance", () => {
      const getByIdUseCase = partUseCase["buildGetPartByIdUseCase"]();
      expect(getByIdUseCase).toBeInstanceOf(GetPartByIdUseCase);
    });
  });

  describe("buildGetPartByPartNumberUseCase", () => {
    it("should create and return GetPartByPartNumberUseCase instance", () => {
      const getByPartNumberUseCase =
        partUseCase["buildGetPartByPartNumberUseCase"]();
      expect(getByPartNumberUseCase).toBeInstanceOf(GetPartByPartNumberUseCase);
    });
  });

  describe("buildUpdatePartUseCase", () => {
    it("should create and return UpdatePartUseCase instance", () => {
      const updateUseCase = partUseCase["buildUpdatePartUseCase"]();
      expect(updateUseCase).toBeInstanceOf(UpdatePartUseCase);
    });
  });
});
