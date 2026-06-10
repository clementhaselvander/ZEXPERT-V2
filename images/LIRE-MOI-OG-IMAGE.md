# Comment générer l'image OG finale (og-zexpert.jpg)

## Étape 1 — Choisir votre version

| Fichier | Style | Usage recommandé |
|---|---|---|
| `og-zexpert-premium.html` | **Ultra premium** — fond sombre, style fintech | **Recommandé** — partage général |
| `og-zexpert-corporate.html` | **Minimaliste corporate** — fond blanc, stats | LinkedIn, professionnels |
| `og-zexpert-conversion.html` | **Conversion** — fond cyan, accroche forte | WhatsApp, groupes clients |

## Étape 2 — Générer le JPG (méthode rapide)

### Option A — Navigateur (gratuit, 2 minutes)
1. Ouvrir le fichier HTML choisi dans **Google Chrome**
2. Appuyer sur `F12` → onglet **Device Toolbar** (icône mobile)
3. Définir la résolution : **1200 × 630**
4. Faire `Ctrl+Shift+P` → taper "screenshot" → **Capture full size screenshot**
5. Renommer le fichier téléchargé en **`og-zexpert.jpg`**
6. Le déposer dans ce dossier `/images/`

### Option B — Outil en ligne (recommandé pour la qualité)
1. Aller sur **https://htmlcsstoimage.com** ou **https://screenshotone.com**
2. Uploader le fichier HTML ou coller le contenu
3. Définir 1200 × 630
4. Télécharger en JPEG (qualité 90%)
5. Renommer et déposer en `/images/og-zexpert.jpg`

### Option C — Node.js / Puppeteer (automatisable)
```bash
npx puppeteer-screenshot --url ./og-zexpert-premium.html --width 1200 --height 630 --output og-zexpert.jpg
```

## Étape 3 — Vérifier le résultat

Après déploiement, tester sur :
- **Facebook** : https://developers.facebook.com/tools/debug/
- **LinkedIn** : https://www.linkedin.com/post-inspector/
- **Twitter** : https://cards-dev.twitter.com/validator
- **WhatsApp** : simplement partager le lien dans une discussion test

> **Important** : ces outils cachent les anciens résultats. Cliquer sur "Scrape Again"
> ou "Refresh" pour forcer la mise à jour du cache.

## Ce qui a été fait automatiquement

- ✅ Balises `og:image`, `og:title`, `og:description`, `og:url` ajoutées sur les 11 pages HTML
- ✅ `twitter:card summary_large_image` sur toutes les pages
- ✅ `og:image:width` et `og:image:height` définis (évite le recadrage automatique)
- ✅ 3 versions de l'image OG créées
- ✅ Aucune image partenaire ne peut plus être prioritaire (tag explicite)
