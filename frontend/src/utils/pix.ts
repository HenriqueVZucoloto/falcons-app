/**
 * Gera o payload EMVCo para transações PIX (padrão BR Code).
 *
 * Implementa o formato TLV (Type-Length-Value) conforme especificação do Banco Central
 * para pagamentos instantâneos via PIX Copia e Cola.
 */
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

    /** Remove acentos e caracteres especiais, converte para maiúsculo e limita o tamanho. */
    private sanitize(value: string, maxLength: number): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .toUpperCase()
            .substring(0, maxLength);
    }

    /** Gera o payload EMVCo completo incluindo o CRC16 de verificação. */
    public getPayload(): string {
        const payload =
            this.getValue('00', '01') +
            this.getMechantAccountInformation() +
            this.getValue('52', '0000') +
            this.getValue('53', '986') +
            this.getValue('54', parseFloat(this.valor).toFixed(2)) +
            this.getValue('58', 'BR') +
            this.getValue('59', this.nome) +
            this.getValue('60', this.cidade) +
            this.getAdditionalDataFieldTemplate();

        return payload + this.getCRC16(payload);
    }

    /** Formata um campo no padrão TLV: ID (2 dígitos) + Tamanho (2 dígitos) + Valor. */
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

    /** Calcula o CRC16 (Polinômio 0x1021 / CCITT-FALSE) para validação do payload. */
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

/**
 * Gera uma string PIX Copia e Cola pronta para uso.
 *
 * @param chave - Chave PIX do beneficiário (CPF, e-mail, telefone ou aleatória)
 * @param nome - Nome do beneficiário (máx. 25 caracteres, sem acentos)
 * @param cidade - Cidade do beneficiário (máx. 15 caracteres)
 * @param valor - Valor da transação em reais
 * @param identificador - Identificador da transação (padrão: '***')
 * @returns Payload EMVCo completo com CRC16
 */
export const generatePixCopyPaste = (chave: string, nome: string, cidade: string, valor: number, identificador: string = '***'): string => {
    const pix = new PixPayload(nome, chave, valor.toString(), cidade, identificador);
    return pix.getPayload();
};
