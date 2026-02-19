import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../masks'

describe('formatCurrency', () => {
    it('should format "5000" as R$ 50,00', () => {
        const result = formatCurrency('5000')
        expect(result.raw).toBe(50)
        expect(result.display).toBe('50,00')
    })

    it('should format "100" as R$ 1,00', () => {
        const result = formatCurrency('100')
        expect(result.raw).toBe(1)
        expect(result.display).toBe('1,00')
    })

    it('should format "1" as R$ 0,01', () => {
        const result = formatCurrency('1')
        expect(result.raw).toBe(0.01)
        expect(result.display).toBe('0,01')
    })

    it('should handle "0" as R$ 0,00', () => {
        const result = formatCurrency('0')
        expect(result.raw).toBe(0)
        expect(result.display).toBe('0,00')
    })

    it('should strip non-digit characters', () => {
        const result = formatCurrency('R$ 50,00')
        expect(result.raw).toBe(50)
        expect(result.display).toBe('50,00')
    })

    it('should handle empty string', () => {
        const result = formatCurrency('')
        expect(result.raw).toBe(0)
        expect(result.display).toBe('0,00')
    })

    it('should handle large values', () => {
        const result = formatCurrency('10000000') // 100.000,00
        expect(result.raw).toBe(100000)
        expect(result.display).toContain('100')
    })
})
