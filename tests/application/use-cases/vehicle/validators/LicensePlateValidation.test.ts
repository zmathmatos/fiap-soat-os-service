import { describe } from "@jest/globals";
import { LicensePlateValidation } from "../../../../../src/application/use-cases/vehicle/validators/LicensePlateValidation";

describe("LicensePlateValidation", () => {
    describe('isValidBrazilianPlate', () => {
        it('should validate Mercosul format license plate (LLLNLNN)', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('ABC1D23');
            expect(result).toBe(true);
        });

        it('should validate old format license plate (LLLNNNN)', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('ABC1234');
            expect(result).toBe(true);
        });

        it('should reject invalid format with lowercase letters', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('abc1D23');
            expect(result).toBe(false);
        });

        it('should reject invalid format with fewer letters', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('AB1D23');
            expect(result).toBe(false);
        });

        it('should reject invalid format with letters in wrong position (Mercosul)', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('A1B1D23');
            expect(result).toBe(false);
        });

        it('should reject empty string', () => {
            const result = LicensePlateValidation.isValidBrazilianPlate('');
            expect(result).toBe(false);
        });
    });
});