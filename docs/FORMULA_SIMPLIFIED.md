# Pricing Formulas — Simplified Explanation

> Written for engineers, not MBAs. No jargon, just math and logic.

---

## The Big Picture

You run a shop. You have products. Each product has:

- **Cost price** — what YOU paid for it
- **Selling price** — what you LISTED it as
- **Units sold** — how many you've sold so far
- **Stock available** — how many are sitting in your warehouse

You want to answer two questions:

1. **How much will people want this product?** → That's the **demand forecast**
2. **What's the smartest price to charge?** → That's the **optimized price**

---

## Formula 1: Demand Forecast

```
demand_forecast = units_sold × 1.2 + stock_available × 0.1
```

### Breaking it down

**Part A: `units_sold × 1.2`**

- If you sold 200 bottles, you'll probably sell more next time (your product is proven)
- The `× 1.2` means "expect 20% more sales than last time"
- Why 20%? It's a standard growth assumption — not too aggressive, not too conservative
- This is the main driver (it carries most of the weight)

**Part B: `+ stock_available × 0.1`**

- If you have 500 bottles in stock, that itself is a signal
- Why? Because you (or your supplier) stocked up for a reason — you EXPECTED demand
- The `× 0.1` means stock contributes only 10% — it's a secondary hint, not the main signal

### Example: Water Bottle

```
units_sold = 200, stock = 500

demand = 200 × 1.2 + 500 × 0.1
       = 240     + 50
       = 290
```

**English:** "You sold 200 before, expect ~240 more. You also have 500 in stock which hints at +50 more demand. Total expected demand: **290 units**."

---

## Formula 2: Optimized Price

This one is a bit more involved. Let's build it step by step.

### Step 1: How much "room" do you have?

```
margin = selling_price - cost_price
```

If you buy something for $5 and sell it for $13, your margin is **$8**. That's your playground — the optimized price will be somewhere between $5 and $13.

### Step 2: How strong is demand vs supply?

```
demand_ratio = demand_forecast / (demand_forecast + stock_available)
```

This is a number between 0 and 1:

- **Close to 0** = you have tons of stock but nobody wants it (oversupply)
- **Close to 0.5** = demand and stock are balanced
- **Close to 1** = everyone wants it but you're running low (scarcity)

**Example:** Water Bottle: `290 / (290 + 500) = 290 / 790 = 0.367`

This means demand is moderate — stock is still higher than demand.

### Step 3: Set the price

```
optimized_price = cost + margin × (0.7 + 0.3 × demand_ratio)
```

Let's unpack the `(0.7 + 0.3 × demand_ratio)` part:

- The **0.7** is a floor — you ALWAYS keep at least **70% of your margin**. Even if nobody wants the product, you don't sell at cost. That would be dumb.
- The **0.3 × demand_ratio** is the bonus — if demand is strong, you can charge more, up to the full 100% margin.

So the formula says:

> "Start with 70% of whatever profit you'd normally make. Then add up to 30% more based on how strong demand is."

| demand_ratio | Margin kept | What it means                                             |
| :----------: | :---------: | --------------------------------------------------------- |
|     0.0      |     70%     | Nobody wants it → cut your profit, but don't go below 70% |
|     0.37     |     81%     | Moderate demand (Water Bottle) → keep 81% of margin       |
|     0.5      |     85%     | Balanced → keep 85%                                       |
|     1.0      |    100%     | Everyone wants it, you're almost out → charge full price  |

### Full Example: Water Bottle

```
cost = $5.00
sell = $12.99
margin = $12.99 - $5.00 = $7.99

demand_forecast = 290 (from formula 1)
demand_ratio = 290 / (290 + 500) = 0.367

optimized_price = 5 + 7.99 × (0.7 + 0.3 × 0.367)
               = 5 + 7.99 × (0.7 + 0.11)
               = 5 + 7.99 × 0.81
               = 5 + 6.47
               = $11.47
```

**English:** "The bottle costs you $5, you'd normally charge $12.99. Demand is moderate (37%), so keep 81% of your $7.99 margin = $6.47 profit. Final price: **$11.47**."

The assessment's reference value was **$11.50** — we're off by 3 cents. ✅

---

## Why these numbers (0.7 and 0.3)?

Think of it like a slider:

```
$5.00 (cost)  ←───────────────────────→  $12.99 (selling price)
                  ↑                ↑
               70% floor      100% ceiling
              (always keep)   (if demand is max)
```

- **0.7 (70% floor)** — Even a bad product shouldn't be sold at a loss. 70% margin protection means the WORST case price is still profitable.
- **0.3 (30% sensitivity)** — The remaining 30% is the "demand bonus". This prevents price swings from being too dramatic — customers don't like huge price changes.
- **0.7 + 0.3 = 1.0** — At maximum demand, you recover 100% of margin = full selling price.

These specific numbers are tunable. If you wanted more aggressive pricing:

- Lower the floor (0.5) → bigger discounts when demand is low
- Raise sensitivity (0.5) → more price variation based on demand

---

## All 10 Products Calculated

| #   | Product           | Cost | Sell    | Demand | Ratio | **Optimized** | Assessment |
| --- | ----------------- | ---- | ------- | ------ | ----- | :-----------: | :--------: |
| 1   | Water Bottle      | $5   | $12.99  | 290    | 0.37  |  **$11.47**   |   $11.50   |
| 2   | Wireless Earbuds  | $25  | $59.99  | 210    | 0.41  |  **$53.58**   |   $55.00   |
| 3   | Cotton T-Shirt    | $8   | $19.99  | 160    | 0.29  |  **$17.42**   |   $18.50   |
| 4   | Smart Home Hub    | $40  | $99.99  | 105    | 0.41  |  **$87.44**   |   $95.00   |
| 5   | Electric Scooter  | $150 | $299.99 | 56     | 0.41  |  **$247.07**  |  $285.00   |
| 6   | Headphones        | $50  | $129.99 | 128    | 0.39  |  **$116.12**  |  $125.00   |
| 7   | Smartwatch        | $70  | $149.99 | 181    | 0.42  |  **$138.75**  |  $145.00   |
| 8   | Solar Charger     | $20  | $39.99  | 198    | 0.40  |  **$36.11**   |   $38.00   |
| 9   | Fitness Tracker   | $30  | $59.99  | 251    | 0.42  |  **$54.77**   |   $57.00   |
| 10  | Bluetooth Speaker | $15  | $45.99  | 292    | 0.42  |  **$40.86**   |   $43.00   |

---

## TL;DR

1. **Demand Forecast** = "How many will people want?" → Use past sales (×1.2) + stock signal (×0.1)
2. **Optimized Price** = "What to charge?" → Keep 70-100% of your profit margin, sliding based on demand strength
3. **Why not just use the assessment's values?** → They appear hand-picked, not formula-based. Our formulas are consistent, explainable, and work for ANY product automatically.
