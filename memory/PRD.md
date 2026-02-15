# DJ LOUK Photobooth System - PRD

## Version: 1.0 MVP
## Date: February 15, 2026

---

## Problem Statement

Création d'un système de photobooth professionnel pour DJ LOUK fonctionnant avec:
- Interface tablette principale (Samsung Tab S7 Ultra)
- Station secondaire (TV + 2 iPads)
- Stockage cloud automatisé
- Système de QR Code individuel par groupe
- Panel d'administration sécurisé avec connexion Google

---

## User Personas

1. **Invités d'événement (Photobooth)**
   - Besoin: Interface simple, fun, intuitive
   - Actions: Prendre photos, recevoir QR code

2. **Participants (Station secondaire)**
   - Besoin: Récupérer facilement leurs photos
   - Actions: Rechercher groupe, scanner QR, télécharger

3. **DJ/Organisateur (Admin)**
   - Besoin: Contrôle total du système
   - Actions: Créer événements, gérer paramètres, voir statistiques

---

## Core Requirements (Static)

### Interface Photobooth
- [ ] Écran d'accueil avec animation
- [ ] Saisie nom du groupe
- [ ] Séquence photo avec compte à rebours
- [ ] Aperçu avec options reprendre/confirmer
- [ ] Écran de traitement avec QR code

### Station Secondaire
- [ ] Page TV avec instructions
- [ ] Recherche de groupe
- [ ] Galerie photos avec téléchargement

### Admin Panel
- [ ] Connexion Google OAuth
- [ ] Dashboard avec statistiques
- [ ] Gestion des événements (CRUD)
- [ ] Paramètres complets
- [ ] Gestion des groupes

---

## What's Been Implemented (February 15, 2026)

### Backend (FastAPI + MongoDB)
- [x] Auth via Emergent Google OAuth
- [x] API Events CRUD
- [x] API Groups CRUD
- [x] API Photos upload/batch
- [x] API Settings
- [x] API Statistics
- [x] Génération QR codes

### Frontend (React + Tailwind + Framer Motion)
- [x] 3 thèmes: Dark (Club), Light, LOUK Party
- [x] Interface Photobooth complète (5 écrans)
- [x] Station secondaire (recherche + galerie)
- [x] Page TV instructions
- [x] Admin Panel complet (login, dashboard, events, settings, groups)
- [x] Galerie publique pour QR codes

### Design
- [x] Fonts: Syne (headers), Manrope (body), Bebas Neue (countdown)
- [x] Effets neon/glow
- [x] Animations avec framer-motion
- [x] Interface touch-friendly

---

## Prioritized Backlog

### P0 - Critical (Required for production)
- [ ] Intégration Google Drive (credentials à fournir)
- [ ] Intégration Mailgun pour envoi emails
- [ ] Configuration Canon T6i / caméra réelle
- [ ] Tests sur tablette réelle

### P1 - Important
- [ ] Génération GIF animé
- [ ] Filtres photo
- [ ] Modération des photos
- [ ] Statistiques avancées avec graphiques

### P2 - Nice to have
- [ ] Export Excel des données
- [ ] Personnalisation logo
- [ ] Sons personnalisables
- [ ] Impression directe

---

## Technical Architecture

```
Frontend (React)
├── /photobooth/* - Interface tablette principale
├── /station/* - Interface iPads
├── /tv - Affichage TV
├── /admin/* - Panel administration
└── /gallery/:id - Galerie publique (QR)

Backend (FastAPI)
├── /api/auth/* - Google OAuth via Emergent
├── /api/events/* - Gestion événements
├── /api/groups/* - Gestion groupes
├── /api/photos/* - Upload photos
├── /api/settings - Configuration
└── /api/stats - Statistiques

Database (MongoDB)
├── users - Utilisateurs admin
├── user_sessions - Sessions auth
├── events - Événements
├── groups - Groupes photos
├── photos - Photos base64
└── settings - Configuration globale
```

---

## Next Action Items

1. **Google Drive Integration**
   - Configurer OAuth credentials dans Google Cloud Console
   - Ajouter GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env

2. **Mailgun Setup**
   - Créer compte Mailgun et vérifier domaine
   - Ajouter MAILGUN_API_KEY et MAILGUN_DOMAIN dans .env

3. **Camera Integration**
   - Tester avec caméra Canon T6i via gPhoto2 ou équivalent

4. **Production Deployment**
   - Configurer pour usage événementiel réel
   - Tests sur tablettes Samsung et iPads
