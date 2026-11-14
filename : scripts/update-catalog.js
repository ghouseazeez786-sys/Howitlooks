  name: Refresh product catalog (Electronics & Appliances)

# Runs once a day automatically, and can also be triggered manually from the
# Actions tab (handy for testing right after adding API credentials below).
on:
  schedule:
    - cron: '17 3 * * *'   # once daily; off-the-hour on purpose, see note in README section below
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  refresh-catalog:
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repo
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install the Amazon PA-API helper package
        run: npm install amazon-paapi --no-save

      - name: Run the catalog refresh script
        env:
          # --- Amazon PA-API ---
          # Only unlocks once the Associates account has 3 qualifying sales.
          # Add these under Settings -> Secrets and variables -> Actions once
          # you have them; until then this step just logs "skipping" and the
          # workflow still succeeds.
          AMAZON_ACCESS_KEY: ${{ secrets.AMAZON_ACCESS_KEY }}
          AMAZON_SECRET_KEY: ${{ secrets.AMAZON_SECRET_KEY }}
          AMAZON_PARTNER_TAG: ${{ secrets.AMAZON_PARTNER_TAG }}
          # --- Flipkart Affiliate API ---
          # Needs a direct affiliate.flipkart.com account + API token
          # (not a 3rd-party network like EarnKaro/GrabCash/INRDeals).
          FLIPKART_AFFILIATE_ID: ${{ secrets.FLIPKART_AFFILIATE_ID }}
          FLIPKART_AFFILIATE_TOKEN: ${{ secrets.FLIPKART_AFFILIATE_TOKEN }}
        run: node scripts/update-catalog.js

      - name: Commit auto-products.js if it changed
        run: |
          if git diff --quiet -- auto-products.js; then
            echo "No changes — nothing to commit."
          else
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add auto-products.js
            git commit -m "Auto-refresh Electronics & Appliances catalog"
            git push
          fi
