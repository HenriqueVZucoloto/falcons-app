import React from 'react';
import {
    HouseIcon,
    ScrollIcon,
    UserIcon,
    SquaresFourIcon,
    UsersIcon,
    CurrencyDollarIcon,
    ChartLineUpIcon
} from '@phosphor-icons/react';

export type PageType =
    | 'home'
    | 'statement'
    | 'profile'
    | 'admin_dashboard'
    | 'admin_athletes'
    | 'admin_charges'
    | 'admin_management';

export interface NavItem {
    id: PageType;
    label: string;
    icon: React.ReactNode;
    section: 'athlete' | 'admin';
}

export const NAV_ITEMS: NavItem[] = [
    // Seção Atleta
    {
        id: 'home',
        label: 'Início',
        icon: <HouseIcon />,
        section: 'athlete'
    },
    {
        id: 'statement',
        label: 'Extrato',
        icon: <ScrollIcon />,
        section: 'athlete'
    },
    {
        id: 'profile',
        label: 'Perfil',
        icon: <UserIcon />,
        section: 'athlete'
    },
    // Seção Admin
    {
        id: 'admin_dashboard',
        label: 'Validação',
        icon: <SquaresFourIcon />,
        section: 'admin'
    },
    {
        id: 'admin_athletes',
        label: 'Atletas',
        icon: <UsersIcon />,
        section: 'admin'
    },
    {
        id: 'admin_charges',
        label: 'Cobranças',
        icon: <CurrencyDollarIcon />,
        section: 'admin'
    },
    {
        id: 'admin_management',
        label: 'Gestão',
        icon: <ChartLineUpIcon />,
        section: 'admin'
    }
];