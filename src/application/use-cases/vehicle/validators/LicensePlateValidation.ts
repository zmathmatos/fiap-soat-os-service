export class LicensePlateValidation {
    static isValidBrazilianPlate(licensePlate: string): boolean {
        // Formato Mercosul: LLLNLNN (ex: ABC1D23)
        // Formato antigo: LLLNNNN (ex: ABC1234)
        const mercosulRegex = /^[A-Z]{3}\d{1}[A-Z]\d{2}$/;
        const oldRegex = /^[A-Z]{3}\d{4}$/;

        return mercosulRegex.test(licensePlate) || oldRegex.test(licensePlate);
    }
}