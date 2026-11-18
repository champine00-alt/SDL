import { Category, Listing, Seller } from '../types';

import heroImg from '../assets/images/hero_marketplace_senegal_1794384364731.jpg';

export const HERO_IMAGE = heroImg;


export const SENEGAL_CITIES = [
  'Toutes les villes',
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Mbour & Saly',
  'Touba',
  'Ziguinchor',
  'Kaolack',
  'Rufisque'
];

export const DAKAR_NEIGHBORHOODS = [
  'Tous les quartiers',
  'Almadies',
  'Plateau',
  'Mermoz',
  'Sacré-Cœur',
  'Ouakam',
  'Yoff',
  'Ngor',
  'Médina',
  'Fann Résidence',
  'Liberté 6',
  'Parcelles Assainies',
  'Grand Yoff',
  'Pikine',
  'Guédiawaye',
  'Hann Maristes'
];

export const CATEGORIES: Category[] = [
  {
    id: 'telephones-electronique',
    name: 'Téléphones & Tablettes',
    iconName: 'Smartphone',
    description: 'Smartphones, tablettes, écouteurs et montres connectées',
    itemCount: 0
  },
  {
    id: 'vetements-chaussures',
    name: 'Vêtements & Mode',
    iconName: 'Shirt',
    description: 'Boubous traditionnels, robes, baskets, sacs et prêt-à-porter',
    itemCount: 0
  },
  {
    id: 'informatique',
    name: 'Ordinateurs & Tech',
    iconName: 'Laptop',
    description: 'PC portables, MacBooks, écrans, claviers et accessoires',
    itemCount: 0
  },
  {
    id: 'electromenager',
    name: 'Électroménager',
    iconName: 'Refrigerator',
    description: 'Réfrigérateurs, climatiseurs, mixeurs, machines à laver',
    itemCount: 0
  },
  {
    id: 'meubles-decoration',
    name: 'Maison & Mobilier',
    iconName: 'Armchair',
    description: 'Canapés, lits, tables à manger, tapis et luminaires',
    itemCount: 0
  },
  {
    id: 'vehicules',
    name: 'Véhicules & Motos',
    iconName: 'Car',
    description: 'Voitures occasion, scooters, motos et vélos à Dakar',
    itemCount: 0
  },
  {
    id: 'livres-loisirs',
    name: 'Livres & Loisirs',
    iconName: 'BookOpen',
    description: 'Romans, manuels scolaires UCAD, sport et jeux vidéo',
    itemCount: 0
  }
];




export const DEFAULT_PLATFORM_SETTINGS = {
  escrowFeePercent: 1.5,
  boostPriceFCFA: 1500,
  maintenanceMode: false,
  autoApproveListings: true
};




