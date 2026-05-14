# OctoCAT Grounding Document: Products and Sales Policy

Purpose: provide a retrieval-friendly, deterministic grounding source for an LLM website agent.

Scope:
- Product information (catalog, technical details, compatibility, common troubleshooting)
- Commercial policy (checkout, shipping, returns, cancellations, warranty, escalation)

Source notes:
- Product names, SKUs, suppliers, and base pricing align with seeded project data.
- Additional details are fictional for demo use.
- SKUs are included for internal retrieval efficiency only. Never surface SKU codes to customers.

## 1. Agent Grounding Rules

Use these rules when answering customers:

1. Prefer exact values from this document over generated guesses.
2. If data is missing, clearly state that the information is not available in the knowledge base and offer escalation, following the system prompt’s guidance for missing-data wording.
3. Never share SKU codes with customers — they are internal identifiers not listed on the website. Use product names instead.
4. For policy questions, quote the relevant threshold and timeline (for example, "30-day returns").
5. Never promise exceptions (fee waivers, deadline extensions) unless a policy section explicitly allows it.
6. If user intent includes safety or injury concerns, immediately escalate to human support.

## 2. Company and Support Profile

```yaml
company:
  brand: OctoCAT Supply
  business_type: Direct-to-consumer ecommerce for smart cat products
  headquarters:
    name: CatTech Global HQ
    address: 123 Whisker Lane, Purrington District
  support:
    email: support@octocat.com
    phone: 1-800-628-6228
    hours_local:
      monday_friday: "08:00-20:00"
      saturday: "09:00-17:00"
      sunday: closed
```

## 3. Catalog Summary (Fast Lookup)

Prices are USD. `current_price` reflects discount logic from seed data.

| SKU | Product | Supplier | Base Price | Discount | Current Price | Inventory | Primary Use |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| CAT-FEED-001 | SmartFeeder One | CatNip Creations | 129.99 | 25% | 97.49 | in_stock | Automated feeding schedules |
| CAT-LITTER-001 | AutoClean Litter Dome | CatNip Creations | 199.99 | 25% | 149.99 | in_stock | Self-cleaning litter management |
| CAT-FLIX-001 | CatFlix Entertainment Portal | WhiskerWare Systems | 89.99 | 0% | 89.99 | in_stock | Enrichment and on-demand play |
| CAT-COLLAR-001 | PawTrack Smart Collar | WhiskerWare Systems | 79.99 | 0% | 79.99 | low_stock | GPS and activity monitoring |
| CAT-CAM-001 | WhiskerCam Pro | PurrTech Innovations | 149.99 | 15% | 127.49 | in_stock | Home monitoring and treat dispensing |
| CAT-BED-001 | ThermoNest Deluxe | PurrTech Innovations | 99.99 | 0% | 99.99 | in_stock | Comfort and thermal support |
| CAT-TREE-001 | ClimbCast Cat Tree | PurrTech Innovations | 299.99 | 10% | 269.99 | backorder_7_10_days | Climbing and multi-zone play |
| CAT-WATER-001 | HydroFlow Smart Bowl | WhiskerWare Systems | 119.99 | 0% | 119.99 | in_stock | Hydration tracking |
| CAT-GROOM-001 | PurrFect Groomer Bot | CatNip Creations | 399.99 | 20% | 319.99 | in_stock | Assisted grooming |
| CAT-POD-001 | MemoryFoam Recovery Pod | PurrTech Innovations | 179.99 | 0% | 179.99 | in_stock | Recovery and senior rest support |
| CAT-DOOR-001 | DoorDash Smart Portal | CatNip Creations | 159.99 | 0% | 159.99 | in_stock | Access control and entry logs |
| CAT-TRACKER-001 | ZoomieTracker AI Mat | WhiskerWare Systems | 79.99 | 0% | 79.99 | in_stock | Motion tracking and activity games |

## 4. Product Knowledge Records

Each record is intentionally normalized for retrieval and tool use.

### 4.1 SmartFeeder One (`CAT-FEED-001`)

```yaml
sku: CAT-FEED-001
name: SmartFeeder One
supplier: CatNip Creations
pricing:
  base_price_usd: 129.99
  discount_pct: 25
  current_price_usd: 97.49
inventory_status: in_stock
category: feeding
positioning: AI feeder that learns snack schedule and meal timing.
core_features:
  - Auto-schedule by time and behavior patterns
  - Portion control in 5 g increments
  - Anti-jam dual auger feed path
  - Meal history in companion app
specs:
  dimensions_in: "11.8 x 8.4 x 14.2"
  weight_lb: 6.4
  capacity_cups: 16
  power: "AC adapter + 72-hour battery backup"
  connectivity: "Wi-Fi 2.4 GHz"
  app_support: [iOS, Android]
in_box:
  - feeder base
  - stainless bowl
  - power adapter
  - quick start guide
best_for:
  - Busy owners needing consistent feeding windows
  - Multi-person households sharing feed responsibility
not_ideal_for:
  - Wet-food-only diets
care:
  cleaning: "Bowl daily; hopper and chute weekly"
  food_type: "Dry kibble only, 4-12 mm"
quick_troubleshooting:
  - "If feeding fails: check kibble size and chute blockage"
  - "If offline: reconnect to 2.4 GHz Wi-Fi"
```

### 4.2 AutoClean Litter Dome (`CAT-LITTER-001`)

```yaml
sku: CAT-LITTER-001
name: AutoClean Litter Dome
supplier: CatNip Creations
pricing:
  base_price_usd: 199.99
  discount_pct: 25
  current_price_usd: 149.99
inventory_status: in_stock
category: litter
positioning: Self-cleaning litter box with waste trend alerts.
core_features:
  - Auto-sift cycle after use
  - Odor-seal waste bin
  - Weight-based usage tracking
  - App alerts for maintenance and unusual patterns
specs:
  dimensions_in: "23.5 x 21.0 x 24.8"
  weight_lb: 18.2
  waste_bin_capacity_days: 10
  power: AC adapter
  connectivity: "Wi-Fi 2.4 GHz"
  litter_type_supported: "Clumping clay and plant-based clumping"
in_box:
  - litter dome unit
  - waste liner starter pack
  - litter mat
  - power adapter
best_for:
  - Daily automation and odor control
  - Households with 1-2 medium cats
not_ideal_for:
  - Non-clumping litter usage
  - Kittens under 3 lb
care:
  cleaning: "Waste drawer 2-3 times weekly; full wipe-down monthly"
quick_troubleshooting:
  - "If cycle is skipped: ensure weight sensor area is unobstructed"
  - "If odor persists: replace liner and check bin seal"
```

### 4.3 CatFlix Entertainment Portal (`CAT-FLIX-001`)

```yaml
sku: CAT-FLIX-001
name: CatFlix Entertainment Portal
supplier: WhiskerWare Systems
pricing: { base_price_usd: 89.99, discount_pct: 0, current_price_usd: 89.99 }
inventory_status: in_stock
category: entertainment
positioning: AI-tailored visual and motion entertainment for indoor enrichment.
core_features:
  - On-demand laser and animation modes
  - Daily enrichment playlists
  - Interest scoring by interaction type
specs:
  dimensions_in: "8.1 x 8.1 x 2.2"
  weight_lb: 1.2
  power: USB-C
  connectivity: "Wi-Fi 2.4/5 GHz"
  app_support: [iOS, Android, Web]
in_box: [portal device, USB-C cable, wall mount kit]
best_for: [Indoor cats needing stimulation, solo daytime enrichment]
not_ideal_for: [Outdoor-only cats]
quick_troubleshooting:
  - "If streams buffer: reduce quality in app settings"
  - "If no interaction detected: reposition device lower to floor level"
```

### 4.4 PawTrack Smart Collar (`CAT-COLLAR-001`)

```yaml
sku: CAT-COLLAR-001
name: PawTrack Smart Collar
supplier: WhiskerWare Systems
pricing: { base_price_usd: 79.99, discount_pct: 0, current_price_usd: 79.99 }
inventory_status: low_stock
category: wearable
positioning: GPS, activity, and mood indicator collar.
core_features:
  - Live GPS pings every 60 seconds
  - Activity and rest balance scoring
  - Escape alert geofence notifications
specs:
  neck_range_in: "7.5-12.5"
  weight_oz: 2.4
  water_resistance: IP67
  battery_life_days: 5
  charging: magnetic dock
  connectivity: "LTE-M + Bluetooth LE"
in_box: [collar, charging dock, size adapters]
best_for: [Indoor-outdoor cats, travel monitoring]
not_ideal_for: [Cats under 6 months or under 5 lb]
quick_troubleshooting:
  - "If GPS lags: move to open sky and refresh app map"
  - "If battery drains quickly: disable high-frequency tracking mode"
```

### 4.5 WhiskerCam Pro (`CAT-CAM-001`)

```yaml
sku: CAT-CAM-001
name: WhiskerCam Pro
supplier: PurrTech Innovations
pricing: { base_price_usd: 149.99, discount_pct: 15, current_price_usd: 127.49 }
inventory_status: in_stock
category: monitoring
positioning: 360 camera with treat dispense and night vision.
core_features:
  - 2K live video with IR night mode
  - Motion and sound alerts
  - Remote treat toss
  - Two-way audio
specs:
  resolution: "2304 x 1296"
  pan_degrees: 360
  tilt_degrees: 120
  treat_capacity_oz: 12
  connectivity: "Wi-Fi 2.4 GHz"
  app_support: [iOS, Android]
in_box: [camera, power adapter, wall mount, starter treat cup]
best_for: [Owners away during workday, behavior observation]
not_ideal_for: [No stable Wi-Fi]
quick_troubleshooting:
  - "If treats jam: use dry treats under 0.5 in"
  - "If night vision is dim: clean lens and remove nearby glare sources"
```

### 4.6 ThermoNest Deluxe (`CAT-BED-001`)

```yaml
sku: CAT-BED-001
name: ThermoNest Deluxe
supplier: PurrTech Innovations
pricing: { base_price_usd: 99.99, discount_pct: 0, current_price_usd: 99.99 }
inventory_status: in_stock
category: comfort
positioning: Self-heating memory foam bed with comfort tuning.
core_features:
  - Temperature self-adjustment based on occupancy
  - Memory foam support core
  - Quiet purr-simulator vibration mode
specs:
  dimensions_in: "24 x 20 x 8"
  weight_lb: 5.6
  heat_range_f: "82-102"
  cover: "Machine-washable zip cover"
  power: AC adapter
in_box: [bed base, washable cover, adapter]
best_for: [Senior cats, colder climates, anxious sleepers]
not_ideal_for: [Chewing-prone pets without supervision]
quick_troubleshooting:
  - "If not warming: confirm occupancy sensor is not covered by extra blanket"
```

### 4.7 ClimbCast Cat Tree (`CAT-TREE-001`)

```yaml
sku: CAT-TREE-001
name: ClimbCast Cat Tree
supplier: PurrTech Innovations
pricing: { base_price_usd: 299.99, discount_pct: 10, current_price_usd: 269.99 }
inventory_status: backorder_7_10_days
category: furniture
positioning: Multi-level modular cat tree with power and audio add-ons.
core_features:
  - 5-level climbing architecture
  - Replaceable sisal posts
  - Accessory power shelf with cable routing
specs:
  dimensions_in: "33 x 25 x 72"
  weight_lb: 42
  max_load_lb: 60
  assembly_time_min: 45
  materials: "Engineered wood, sisal rope, plush fabric"
in_box: [tree components, hardware kit, anti-tip wall strap]
best_for: [High-energy climbers, multi-cat homes]
not_ideal_for: [Tiny apartments under 300 sq ft]
care:
  maintenance: "Tighten hardware every 60 days"
quick_troubleshooting:
  - "If wobble occurs: re-level base and secure wall strap"
```

### 4.8 HydroFlow Smart Bowl (`CAT-WATER-001`)

```yaml
sku: CAT-WATER-001
name: HydroFlow Smart Bowl
supplier: WhiskerWare Systems
pricing: { base_price_usd: 119.99, discount_pct: 0, current_price_usd: 119.99 }
inventory_status: in_stock
category: hydration
positioning: Smart fountain with hydration trend monitoring.
core_features:
  - Triple-stage filtration
  - Flow pattern modes (gentle, stream, pulse)
  - Hydration reminders and usage graphing
specs:
  capacity_liters: 2.5
  noise_db: "<30"
  filter_life_days: 30
  power: USB-C
  connectivity: "Wi-Fi 2.4 GHz"
in_box: [fountain base, filter cartridge, pump, USB-C power cable]
best_for: [Picky drinkers, hydration monitoring]
not_ideal_for: [Households unable to clean weekly]
quick_troubleshooting:
  - "If pump noise increases: refill water and clean intake"
```

### 4.9 PurrFect Groomer Bot (`CAT-GROOM-001`)

```yaml
sku: CAT-GROOM-001
name: PurrFect Groomer Bot
supplier: CatNip Creations
pricing: { base_price_usd: 399.99, discount_pct: 20, current_price_usd: 319.99 }
inventory_status: in_stock
category: grooming
positioning: Automated grooming station with stress-aware routines.
core_features:
  - Brush intensity adjustment by coat type
  - Low-noise motor with pause-on-resistance safety
  - Nail trim guidance mode
specs:
  dimensions_in: "26 x 20 x 24"
  weight_lb: 24
  grooming_modes: 6
  power: AC adapter
  connectivity: "Wi-Fi 2.4 GHz + Bluetooth LE"
in_box: [grooming unit, brush heads, clip guard set, cleaning tool]
best_for: [Long-hair cats, routine grooming support]
not_ideal_for: [Cats with acute skin irritation until vet clearance]
quick_troubleshooting:
  - "If cat exits early: start with 5-minute acclimation mode"
```

### 4.10 MemoryFoam Recovery Pod (`CAT-POD-001`)

```yaml
sku: CAT-POD-001
name: MemoryFoam Recovery Pod
supplier: PurrTech Innovations
pricing: { base_price_usd: 179.99, discount_pct: 0, current_price_usd: 179.99 }
inventory_status: in_stock
category: recovery
positioning: Therapeutic pod for post-procedure or senior comfort.
core_features:
  - Contour memory foam basin
  - Gentle heat therapy profile
  - Rest-duration tracking sensor
specs:
  dimensions_in: "28 x 22 x 14"
  weight_lb: 9.1
  temp_range_f: "80-100"
  power: AC adapter
in_box: [recovery pod, washable liner, adapter]
best_for: [Senior cats, post-surgery rest with vet approval]
not_ideal_for: [Active kittens that avoid enclosed spaces]
quick_troubleshooting:
  - "If heating seems uneven: remove extra padding layers and recalibrate in app"
```

### 4.11 DoorDash Smart Portal (`CAT-DOOR-001`)

```yaml
sku: CAT-DOOR-001
name: DoorDash Smart Portal
supplier: CatNip Creations
pricing: { base_price_usd: 159.99, discount_pct: 0, current_price_usd: 159.99 }
inventory_status: in_stock
category: access_control
positioning: Smart cat door with facial recognition and schedule rules.
core_features:
  - Entry allowlist by pet profile
  - Time-based lock schedules
  - In/out event logs
specs:
  cutout_in: "8.5 x 9.5"
  frame_depth_in: "1.25-2.75"
  weather_rating: "IP54"
  power: "4x AA backup + AC optional"
  connectivity: "Wi-Fi 2.4 GHz"
in_box: [door assembly, install template, weather seals, screw kit]
best_for: [Timed access control, nighttime lockout rules]
not_ideal_for: [Rentals without wall/door modification approval]
quick_troubleshooting:
  - "If recognition fails: re-enroll profile in brighter light"
```

### 4.12 ZoomieTracker AI Mat (`CAT-TRACKER-001`)

```yaml
sku: CAT-TRACKER-001
name: ZoomieTracker AI Mat
supplier: WhiskerWare Systems
pricing: { base_price_usd: 79.99, discount_pct: 0, current_price_usd: 79.99 }
inventory_status: in_stock
category: activity
positioning: Motion-sensing play mat that tracks activity bursts.
core_features:
  - LED chase-light game modes
  - Burst detection and weekly activity reports
  - Quiet mode for evening sessions
specs:
  dimensions_in: "30 x 22 x 0.8"
  weight_lb: 2.1
  power: "Rechargeable battery, 10-hour runtime"
  charging: USB-C
  connectivity: Bluetooth LE
in_box: [play mat, USB-C cable, quick guide]
best_for: [Apartment enrichment, short high-energy play sessions]
not_ideal_for: [Outdoor use in wet conditions]
quick_troubleshooting:
  - "If lights do not trigger: switch to active mode and verify battery above 20%"
```

## 5. Recommendation Rules for Agent Use

If user asks for recommendations:

1. Ask budget range if not provided.
2. Ask goal category (feeding, litter, hydration, monitoring, comfort, grooming, activity).
3. Return 2-3 products max with:
- product name (never include SKU)
- current price
- one-line reason based on `best_for`
- one trade-off from `not_ideal_for`

Quick defaults:
- First-time smart setup: `CAT-FEED-001` + `CAT-CAM-001`
- Under $100: `CAT-COLLAR-001`, `CAT-TRACKER-001`, `CAT-FLIX-001`, `CAT-BED-001`
- Premium automation bundle: `CAT-LITTER-001` + `CAT-GROOM-001` + `CAT-DOOR-001`

## 6. Sales and Order Policy (Normalized)

```yaml
checkout:
  flow:
    - add_to_cart
    - shipping_and_tax_estimate
    - guest_or_account_checkout
    - payment_authorization
    - order_confirmation_email_within_minutes: 2
    - fulfillment_pick_pack_business_days: 1
    - tracking_email_on_label_creation: true
  payments:
    cards: [Visa, Mastercard, American Express, Discover]
    express: [Apple Pay, Google Pay, Shop Pay]
    bnpl: CatPay Installments
    gift_cards: OctoCAT digital gift cards
  fraud_review:
    high_value_threshold_usd: 500
    triggers:
      - billing_shipping_mismatch
      - unusual_velocity_or_device_signal
    typical_resolution_hours: 4
```

## 7. Shipping Policy (Normalized)

```yaml
shipping:
  regions:
    domestic_us: all_50_states
    us_territories: limited_speed_options
    international: [Canada, UK, EU, Australia, New Zealand]
  domestic_rates_usd:
    standard_3_5_days: 6.95
    expedited_2_days: 14.95
    priority_next_day_select_zip: 24.95
  free_shipping:
    eligible: true
    threshold_post_discount_subtotal_usd: 75
    method: standard_only
  fulfillment_cutoff:
    local_warehouse_time: "14:00"
    same_day_if_before_cutoff_business_day: true
  split_shipments:
    possible_for_mixed_availability: true
    extra_shipping_charge_default: false
```

## 8. Returns, Exchanges, and Refund Policy (Normalized)

```yaml
returns:
  standard_window_days: 30
  holiday_extension:
    purchase_range: "Nov 15-Dec 31"
    return_deadline: "Jan 31"
  eligibility:
    allowed:
      - new_or_lightly_used_good_condition
      - defective_damaged_or_wrong_item
    excluded:
      - final_sale
      - gift_cards
      - misuse_or_unauthorized_modification
  fees:
    defective_or_wrong_item_return_label_usd: 0
    preference_return_label_fee_usd: 7.50
    oversize_return_fee_usd: 15
    oversize_examples: [CAT-TREE-001]
  refunds:
    processing_after_inspection_business_days: "3-7"
    bank_posting_possible_business_days: "up to 10"
  exchanges:
    direct_exchange_if_in_stock: true
    otherwise_refund_and_reorder: true
```

## 9. Cancellations and Order Changes

```yaml
order_changes:
  cancellation_window_minutes: 30
  cancellation_after_packing: not_guaranteed
  address_change_allowed_until: carrier_label_creation
  quantity_change_after_fulfillment_start: cancel_and_replace
```

## 10. Warranty and Support Policy

```yaml
warranty:
  standard:
    duration_years: 1
    covers:
      - manufacturing_defects
      - hardware_failure_normal_use
  extended_plan:
    name: OctoCare+
    duration_years: 2
    accidental_damage_claims_per_year: 2
support_workflow:
  required_fields:
    - customer_name
    - order_email
    - order_number
    - sku
    - issue_summary
  troubleshooting_steps:
    - identify_issue_type_setup_connectivity_physical_performance
    - provide_basic_steps
    - if_unresolved_collect_logs_or_media
    - route_to_replacement_or_warranty_review
```

## 11. Human Escalation Triggers

Always hand off to a human if any of the following appears:

- mention of legal action or chargeback
- pet injury or safety incident
- repeated failed deliveries
- payment capture or fraud lock mismatch
- request for policy exception outside published rules

## 12. Canonical FAQ Responses

Q: Do you offer free shipping?
A: Yes. Free standard shipping applies to domestic orders with post-discount subtotal of $75 or more.

Q: How long do refunds take?
A: Refunds are issued in 3-7 business days after return inspection, with some banks taking up to 10 business days to post funds.

Q: Can I return an item if my cat does not like it?
A: Yes, within 30 days in good condition. A $7.50 return label fee may apply for preference-based returns.

Q: What is the best starter setup?
A: A common starter pair is the SmartFeeder One and WhiskerCam Pro.

Q: Do you ship internationally?
A: Yes, to selected countries including Canada, UK, EU, Australia, and New Zealand.

Q: Do products include warranty?
A: Most connected products include a 1-year limited warranty for manufacturing defects and normal-use hardware failures.

## 13. Intent Routing Hints

- `product_lookup`: name, SKU, supplier, price, specs, compatibility
- `product_compare`: compare by price, category, size, or usage goals
- `product_recommendation`: shortlist with budget + goals + trade-offs
- `shipping_question`: regions, transit times, shipping costs, cutoff time
- `return_question`: eligibility, windows, fees, refund timing
- `order_change`: cancellation and address/quantity edits
- `warranty_claim`: policy check + troubleshooting + claim intake
- `human_handoff`: any safety/legal/fraud-risk scenario

## 14. Demo Disclaimer

This file is intentionally fictional for demo and prototyping. Legal, tax, consumer rights, privacy, and regional compliance review are required before production use.
