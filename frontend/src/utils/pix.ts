export class PixPayload {
    private nome: string;
    private chave: string;
    private valor: string;
    private cidade: string;
    private txtId: string;

    constructor(nome: string, chave: string, valor: string, cidade: string, txtId: string) {
        this.nome = this.sanitize(nome, 25);
        this.chave = chave;
        this.valor = valor.replace(',', '.');
        this.cidade = this.sanitize(cidade, 15);
        this.txtId = txtId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25);
    }

    private sanitize(value: string, maxLength: number): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-zA-Z0-9 ]/g, "") // Apenas letras, números e espaços
            .toUpperCase()
            .substring(0, maxLength);
    }

    // Gera o Payload completo
    public getPayload(): string {
        const payload =
            this.getValue('00', '01') + // Payload Format Indicator
            this.getMechantAccountInformation() + // Merchant Account Information
            this.getValue('52', '0000') + // Merchant Category Code
            this.getValue('53', '986') + // Transaction Currency
            this.getValue('54', parseFloat(this.valor).toFixed(2)) + // Transaction Amount
            this.getValue('58', 'BR') + // Country Code
            this.getValue('59', this.nome) + // Merchant Name
            this.getValue('60', this.cidade) + // Merchant City
            this.getAdditionalDataFieldTemplate(); // Additional Data Field Template

        return payload + this.getCRC16(payload);
    }

    // Formata os campos TLV (Type-Length-Value)
    private getValue(id: string, value: string): string {
        const size = String(value.length).padStart(2, '0');
        return id + size + value;
    }

    private getMechantAccountInformation(): string {
        const gui = this.getValue('00', 'br.gov.bcb.pix');
        const key = this.getValue('01', this.chave);
        return this.getValue('26', gui + key);
    }

    private getAdditionalDataFieldTemplate(): string {
        const txid = this.getValue('05', this.txtId || '***');
        return this.getValue('62', txid);
    }

    // Calcula o CRC16 (Polinômio 0x1021 / CCITT-FALSE)
    private getCRC16(payload: string): string {
        const payloadWithId = payload + '6304';
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < payloadWithId.length; i++) {
            crc ^= (payloadWithId.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = ((crc << 1) ^ polynomial) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }

        return '6304' + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }
}

// Helper fácil de usar
export const generatePixCopyPaste = (chave: string, nome: string, cidade: string, valor: number, identificador: string = '***'): string => {
    const pix = new PixPayload(nome, chave, valor.toString(), cidade, identificador);
    return pix.getPayload();
};
