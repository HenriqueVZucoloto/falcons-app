import { describe, it, expect } from 'vitest'
import { PixPayload, generatePixCopyPaste } from '../pix'

describe('PixPayload', () => {
    const defaultArgs = {
        nome: 'CAASO FALCONS',
        chave: '12345678900',
        valor: '50.00',
        cidade: 'SAO CARLOS',
        txtId: 'FLC001',
    }

    it('should generate a valid payload string', () => {
        const pix = new PixPayload(
            defaultArgs.nome, defaultArgs.chave, defaultArgs.valor,
            defaultArgs.cidade, defaultArgs.txtId
        )
        const payload = pix.getPayload()

        expect(payload).toContain('000201') // Payload Format Indicator (ID=00, value=01)
        expect(payload).toContain('br.gov.bcb.pix') // GUI
        expect(payload).toContain(defaultArgs.chave) // Chave PIX
        expect(payload).toContain('50.00') // Valor
        expect(payload).toContain('6304') // CRC16 marker
    })

    it('should sanitize accented characters from name', () => {
        const pix = new PixPayload(
            'José da Conceição', '12345678900', '10.00',
            'São Carlos', 'TST'
        )
        const payload = pix.getPayload()

        expect(payload).not.toContain('é')
        expect(payload).not.toContain('ã')
        expect(payload).not.toContain('ç')
        expect(payload).toContain('JOSE DA CONCEICAO')
    })

    it('should truncate name to 25 characters', () => {
        const longName = 'A'.repeat(50)
        const pix = new PixPayload(longName, '123', '10.00', 'CIDADE', 'X')
        const payload = pix.getPayload()

        // Name field (ID 59) should contain at most 25 chars
        const nameMatch = payload.match(/59(\d{2})([A-Z]+)/)
        expect(nameMatch).not.toBeNull()
        expect(nameMatch![2].length).toBeLessThanOrEqual(25)
    })

    it('should truncate city to 15 characters', () => {
        const longCity = 'B'.repeat(30)
        const pix = new PixPayload('TEST', '123', '10.00', longCity, 'X')
        const payload = pix.getPayload()

        const cityMatch = payload.match(/60(\d{2})([A-Z]+)/)
        expect(cityMatch).not.toBeNull()
        expect(cityMatch![2].length).toBeLessThanOrEqual(15)
    })

    it('should handle comma-separated values', () => {
        const pix = new PixPayload('TEST', '123', '99,50', 'CITY', 'X')
        const payload = pix.getPayload()

        expect(payload).toContain('99.50')
    })

    it('should generate a valid CRC16 checksum (last 4 hex chars)', () => {
        const pix = new PixPayload('TEST', '123', '10.00', 'CITY', 'X')
        const payload = pix.getPayload()

        // CRC16 is always at the end: 6304XXXX (4 hex digits)
        const crcPart = payload.slice(-8)
        expect(crcPart).toMatch(/^6304[0-9A-F]{4}$/)
    })
})

describe('generatePixCopyPaste', () => {
    it('should return a complete payload string', () => {
        const result = generatePixCopyPaste('12345678900', 'FALCONS', 'SAO CARLOS', 50.0, 'FLC01')

        expect(result).toContain('000201')
        expect(result).toContain('br.gov.bcb.pix')
        expect(result).toContain('12345678900')
        expect(result).toContain('50.00')
    })

    it('should use default identifier when not provided', () => {
        const result = generatePixCopyPaste('123', 'TEST', 'CITY', 10.0)
        expect(result).toContain('***')
    })
})
