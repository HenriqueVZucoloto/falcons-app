import { describe, it, expect } from 'vitest'
import { NAV_ITEMS } from '../navigation'

describe('NAV_ITEMS', () => {
    it('should contain exactly 7 navigation items', () => {
        expect(NAV_ITEMS).toHaveLength(7)
    })

    it('should have 3 athlete items and 4 admin items', () => {
        const athleteItems = NAV_ITEMS.filter(i => i.section === 'athlete')
        const adminItems = NAV_ITEMS.filter(i => i.section === 'admin')

        expect(athleteItems).toHaveLength(3)
        expect(adminItems).toHaveLength(4)
    })

    it('should have correct athlete page IDs', () => {
        const athleteIds = NAV_ITEMS.filter(i => i.section === 'athlete').map(i => i.id)
        expect(athleteIds).toEqual(['home', 'statement', 'profile'])
    })

    it('should have correct admin page IDs', () => {
        const adminIds = NAV_ITEMS.filter(i => i.section === 'admin').map(i => i.id)
        expect(adminIds).toEqual(['admin_dashboard', 'admin_athletes', 'admin_charges', 'admin_management'])
    })

    it('should have id, label, icon, and section on every item', () => {
        NAV_ITEMS.forEach(item => {
            expect(item.id).toBeDefined()
            expect(item.label).toBeTruthy()
            expect(item.icon).toBeDefined()
            expect(item.section).toMatch(/^(athlete|admin)$/)
        })
    })
})
