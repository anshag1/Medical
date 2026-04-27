import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function createPlaceholder(
  dir: string,
  filename: string,
  bgColor: string,
  label: string
): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor}cc;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <rect x="40" y="40" width="520" height="320" rx="16" fill="rgba(255,255,255,0.15)"/>
    <text x="300" y="180" font-family="Arial,sans-serif" font-size="28" font-weight="bold"
      fill="white" text-anchor="middle" dominant-baseline="middle">💊</text>
    <text x="300" y="230" font-family="Arial,sans-serif" font-size="18" font-weight="600"
      fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="300" y="270" font-family="Arial,sans-serif" font-size="13"
      fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">MediCatalogue</text>
  </svg>`

  const buf = Buffer.from(svg)
  await sharp(buf).resize(600, 400).webp({ quality: 85 }).toFile(path.join(dir, filename))
  await sharp(buf).resize(400, 267).webp({ quality: 85 }).toFile(path.join(dir, `thumb-${filename}`))
}

const PRODUCTS = [
  // Antibiotics
  {
    name: 'Amoxicillin 500mg Capsules',
    genericName: 'Amoxicillin',
    manufacturer: 'GlaxoSmithKline',
    category: 'Antibiotics',
    form: 'Capsule',
    strength: '500mg',
    packSize: '21 capsules',
    description: 'Amoxicillin 500mg is a broad-spectrum penicillin-type antibiotic used to treat a wide variety of bacterial infections.',
    composition: 'Each capsule contains Amoxicillin trihydrate equivalent to 500mg of Amoxicillin.',
    indications: 'Treatment of infections caused by susceptible organisms including respiratory tract infections, urinary tract infections, skin and soft tissue infections, and ear infections.',
    dosage: 'Adults: 250–500mg every 8 hours. Children: 25mg/kg/day in divided doses. Course duration: 5–14 days as directed by physician.',
    sideEffects: 'Nausea, diarrhoea, rash, hypersensitivity reactions. Discontinue if allergic reaction occurs.',
    storage: 'Store below 25°C in a dry place. Keep away from direct sunlight. Keep out of reach of children.',
    isFeatured: true,
    tags: ['antibiotic', 'penicillin', 'bacterial-infection'],
    color: '#2563eb',
  },
  {
    name: 'Azithromycin 250mg Tablets',
    genericName: 'Azithromycin',
    manufacturer: 'Pfizer',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '250mg',
    packSize: '6 tablets',
    description: 'Azithromycin is a macrolide antibiotic used to treat infections of the respiratory tract, skin, and other areas.',
    composition: 'Each tablet contains Azithromycin dihydrate equivalent to 250mg of Azithromycin.',
    indications: 'Community-acquired pneumonia, acute exacerbations of chronic bronchitis, sinusitis, pharyngitis, tonsillitis, uncomplicated skin infections.',
    dosage: 'Adults: 500mg on day 1, then 250mg once daily on days 2–5. Children: consult physician.',
    sideEffects: 'Abdominal pain, nausea, vomiting, diarrhoea. Rare: hepatotoxicity, cardiac arrhythmias.',
    storage: 'Store at room temperature (15–30°C). Protect from moisture.',
    isFeatured: false,
    tags: ['antibiotic', 'macrolide', 'respiratory'],
    color: '#1d4ed8',
  },
  {
    name: 'Ciprofloxacin 500mg Tablets',
    genericName: 'Ciprofloxacin',
    manufacturer: 'Bayer',
    category: 'Antibiotics',
    form: 'Tablet',
    strength: '500mg',
    packSize: '10 tablets',
    description: 'Ciprofloxacin is a fluoroquinolone antibiotic with activity against both gram-negative and gram-positive bacteria.',
    composition: 'Each tablet contains Ciprofloxacin hydrochloride equivalent to 500mg Ciprofloxacin.',
    indications: 'Urinary tract infections, respiratory tract infections, bone and joint infections, skin infections, typhoid fever.',
    dosage: 'Adults: 250–750mg twice daily for 7–14 days. Adjust for renal impairment.',
    sideEffects: 'Nausea, diarrhoea, headache, dizziness. Rare: tendon rupture, peripheral neuropathy.',
    storage: 'Store below 30°C. Protect from light and moisture.',
    isFeatured: false,
    tags: ['antibiotic', 'fluoroquinolone', 'UTI'],
    color: '#1e40af',
  },
  // Analgesics
  {
    name: 'Paracetamol 500mg Tablets',
    genericName: 'Paracetamol (Acetaminophen)',
    manufacturer: 'Johnson & Johnson',
    category: 'Analgesics',
    form: 'Tablet',
    strength: '500mg',
    packSize: '24 tablets',
    description: 'Paracetamol 500mg is an analgesic and antipyretic used to relieve mild to moderate pain and reduce fever.',
    composition: 'Each tablet contains 500mg Paracetamol with inactive excipients.',
    indications: 'Relief of mild to moderate pain including headache, toothache, backache, menstrual pain, and reduction of fever.',
    dosage: 'Adults: 500mg–1g every 4–6 hours as needed. Maximum 4g/day. Children: weight-based dosing.',
    sideEffects: 'Generally well tolerated. Overdose causes serious hepatotoxicity. Rare: skin reactions.',
    storage: 'Store below 25°C. Keep in original packaging.',
    isFeatured: true,
    tags: ['analgesic', 'antipyretic', 'pain-relief', 'fever'],
    color: '#dc2626',
  },
  {
    name: 'Ibuprofen 400mg Tablets',
    genericName: 'Ibuprofen',
    manufacturer: 'Reckitt Benckiser',
    category: 'Analgesics',
    form: 'Tablet',
    strength: '400mg',
    packSize: '24 tablets',
    description: 'Ibuprofen is a non-steroidal anti-inflammatory drug (NSAID) providing pain relief, anti-inflammatory, and antipyretic effects.',
    composition: 'Each tablet contains 400mg Ibuprofen.',
    indications: 'Relief of mild to moderate pain, fever, inflammation in conditions such as arthritis, muscle pain, dental pain.',
    dosage: 'Adults: 400mg every 4–6 hours. Maximum 1200mg/day OTC. Take with food.',
    sideEffects: 'Gastrointestinal discomfort, nausea. Risk of peptic ulcer with prolonged use. Contraindicated in renal impairment.',
    storage: 'Store below 25°C. Keep in dry conditions.',
    isFeatured: false,
    tags: ['NSAID', 'anti-inflammatory', 'pain-relief'],
    color: '#b91c1c',
  },
  {
    name: 'Diclofenac Sodium 50mg Tablets',
    genericName: 'Diclofenac Sodium',
    manufacturer: 'Novartis',
    category: 'Analgesics',
    form: 'Tablet',
    strength: '50mg',
    packSize: '20 tablets',
    description: 'Diclofenac Sodium is an NSAID with potent analgesic and anti-inflammatory properties used for musculoskeletal conditions.',
    composition: 'Each tablet contains 50mg Diclofenac Sodium (enteric-coated).',
    indications: 'Rheumatoid arthritis, osteoarthritis, acute gout, ankylosing spondylitis, musculoskeletal pain.',
    dosage: 'Adults: 50mg 2–3 times daily after food. Do not crush enteric-coated tablets.',
    sideEffects: 'GI disturbance, elevated liver enzymes. Cardiovascular risk with long-term use.',
    storage: 'Store below 30°C away from moisture and light.',
    isFeatured: false,
    tags: ['NSAID', 'anti-inflammatory', 'arthritis'],
    color: '#ef4444',
  },
  // Vitamins & Supplements
  {
    name: 'Vitamin C 1000mg Effervescent Tablets',
    genericName: 'Ascorbic Acid',
    manufacturer: 'Bayer',
    category: 'Vitamins & Supplements',
    form: 'Tablet',
    strength: '1000mg',
    packSize: '20 tablets',
    description: 'Vitamin C 1000mg effervescent tablets provide high-dose ascorbic acid for immune support and antioxidant protection.',
    composition: 'Each tablet provides 1000mg Ascorbic Acid with citric acid, sodium bicarbonate, and flavouring.',
    indications: 'Prevention and treatment of Vitamin C deficiency, immune support, antioxidant supplementation.',
    dosage: 'Adults: 1 tablet dissolved in water once daily. Do not exceed recommended dose.',
    sideEffects: 'High doses may cause GI discomfort, diarrhoea. Kidney stones with very high doses in susceptible individuals.',
    storage: 'Store in cool dry place. Once opened, use within 2 months.',
    isFeatured: true,
    tags: ['vitamin', 'immune-support', 'antioxidant', 'ascorbic-acid'],
    color: '#16a34a',
  },
  {
    name: 'Vitamin D3 1000 IU Softgels',
    genericName: 'Cholecalciferol',
    manufacturer: 'Nature\'s Best',
    category: 'Vitamins & Supplements',
    form: 'Capsule',
    strength: '1000 IU',
    packSize: '60 softgels',
    description: 'Vitamin D3 softgels provide cholecalciferol for bone health, calcium absorption, and immune function.',
    composition: 'Each softgel contains 1000 IU Cholecalciferol (Vitamin D3) in a sunflower oil base.',
    indications: 'Vitamin D deficiency, bone health maintenance, calcium absorption support.',
    dosage: 'Adults: 1–2 softgels daily with a fatty meal for optimal absorption.',
    sideEffects: 'Generally safe at recommended doses. High doses may cause hypercalcaemia.',
    storage: 'Store at room temperature away from heat and moisture.',
    isFeatured: false,
    tags: ['vitamin-D', 'bone-health', 'immune'],
    color: '#15803d',
  },
  {
    name: 'Omega-3 Fish Oil 1000mg Softgels',
    genericName: 'Omega-3 Fatty Acids (EPA/DHA)',
    manufacturer: 'Seven Seas',
    category: 'Vitamins & Supplements',
    form: 'Capsule',
    strength: '1000mg',
    packSize: '90 softgels',
    description: 'High-purity fish oil providing EPA and DHA omega-3 fatty acids for cardiovascular and brain health.',
    composition: 'Each softgel contains 1000mg fish oil providing 180mg EPA and 120mg DHA.',
    indications: 'Cardiovascular health, triglyceride reduction, cognitive function, joint health.',
    dosage: 'Adults: 1–3 softgels daily with meals. Consult physician for therapeutic doses.',
    sideEffects: 'Fishy aftertaste. May increase bleeding time. Avoid high doses before surgery.',
    storage: 'Refrigerate after opening. Best consumed within 3 months of opening.',
    isFeatured: false,
    tags: ['omega-3', 'fish-oil', 'heart-health'],
    color: '#166534',
  },
  // Cardiovascular
  {
    name: 'Atorvastatin 20mg Tablets',
    genericName: 'Atorvastatin Calcium',
    manufacturer: 'Pfizer',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '20mg',
    packSize: '28 tablets',
    description: 'Atorvastatin is a HMG-CoA reductase inhibitor (statin) used to lower cholesterol and reduce the risk of cardiovascular events.',
    composition: 'Each tablet contains Atorvastatin calcium equivalent to 20mg Atorvastatin.',
    indications: 'Hypercholesterolaemia, mixed dyslipidaemia, prevention of cardiovascular events in high-risk patients.',
    dosage: 'Adults: 10–80mg once daily at any time of day. Dose adjusted based on lipid response.',
    sideEffects: 'Myopathy, rhabdomyolysis (rare), elevated liver enzymes, headache, GI disturbance.',
    storage: 'Store below 30°C. Protect from light.',
    isFeatured: true,
    tags: ['statin', 'cholesterol', 'cardiovascular'],
    color: '#7c3aed',
  },
  {
    name: 'Amlodipine 5mg Tablets',
    genericName: 'Amlodipine Besylate',
    manufacturer: 'Pfizer',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '5mg',
    packSize: '28 tablets',
    description: 'Amlodipine is a calcium channel blocker used in the treatment of hypertension and angina.',
    composition: 'Each tablet contains Amlodipine besylate equivalent to 5mg Amlodipine.',
    indications: 'Hypertension, chronic stable angina, vasospastic angina (Prinzmetal\'s angina).',
    dosage: 'Adults: 5mg once daily. Maximum 10mg/day. Dose may be increased after 1–2 weeks.',
    sideEffects: 'Peripheral oedema, headache, dizziness, flushing, palpitations.',
    storage: 'Store below 30°C away from moisture.',
    isFeatured: false,
    tags: ['calcium-channel-blocker', 'hypertension', 'angina'],
    color: '#6d28d9',
  },
  {
    name: 'Metoprolol Succinate 50mg Tablets',
    genericName: 'Metoprolol Succinate',
    manufacturer: 'AstraZeneca',
    category: 'Cardiovascular',
    form: 'Tablet',
    strength: '50mg',
    packSize: '30 tablets',
    description: 'Metoprolol succinate is a selective beta-1 adrenergic blocker used for hypertension, angina, and heart failure.',
    composition: 'Each extended-release tablet contains 50mg Metoprolol Succinate.',
    indications: 'Hypertension, angina pectoris, stable symptomatic heart failure, acute myocardial infarction.',
    dosage: 'Adults: 25–200mg once daily. Swallow whole; do not crush or chew.',
    sideEffects: 'Bradycardia, fatigue, dizziness, cold extremities. Do not stop abruptly.',
    storage: 'Store below 25°C in original packaging.',
    isFeatured: false,
    tags: ['beta-blocker', 'hypertension', 'heart-failure'],
    color: '#5b21b6',
  },
  // Dermatology
  {
    name: 'Clotrimazole 1% Cream',
    genericName: 'Clotrimazole',
    manufacturer: 'Bayer',
    category: 'Dermatology',
    form: 'Cream',
    strength: '1%',
    packSize: '20g tube',
    description: 'Clotrimazole 1% cream is an antifungal agent for topical treatment of fungal skin infections.',
    composition: 'Each gram of cream contains 10mg Clotrimazole in an emollient cream base.',
    indications: 'Tinea pedis (athlete\'s foot), tinea cruris (jock itch), tinea corporis (ringworm), candidal skin infections.',
    dosage: 'Apply thinly to affected area 2–3 times daily. Continue treatment for 4 weeks even if symptoms resolve.',
    sideEffects: 'Local irritation, burning, stinging. Discontinue if reaction worsens.',
    storage: 'Store below 25°C. Do not freeze.',
    isFeatured: false,
    tags: ['antifungal', 'topical', 'skin-infection'],
    color: '#0891b2',
  },
  {
    name: 'Hydrocortisone 1% Cream',
    genericName: 'Hydrocortisone',
    manufacturer: 'Alliance Pharma',
    category: 'Dermatology',
    form: 'Cream',
    strength: '1%',
    packSize: '15g tube',
    description: 'Hydrocortisone 1% cream is a mild corticosteroid for relief of inflammatory and pruritic skin conditions.',
    composition: 'Each gram contains 10mg Hydrocortisone acetate in an aqueous cream base.',
    indications: 'Eczema, dermatitis, insect bite reactions, mild psoriasis on the face and skin folds.',
    dosage: 'Apply sparingly to affected area 1–2 times daily. Not for use on the face for more than 7 days.',
    sideEffects: 'Skin thinning with prolonged use, striae. Avoid mucous membranes and eyes.',
    storage: 'Store below 25°C. Do not refrigerate.',
    isFeatured: false,
    tags: ['corticosteroid', 'anti-inflammatory', 'eczema'],
    color: '#0e7490',
  },
  {
    name: 'Salicylic Acid 2% Gel',
    genericName: 'Salicylic Acid',
    manufacturer: 'La Roche-Posay',
    category: 'Dermatology',
    form: 'Gel',
    strength: '2%',
    packSize: '30ml',
    description: 'Salicylic acid 2% gel is a keratolytic agent used for acne treatment and management of keratotic skin conditions.',
    composition: 'Each gram contains 20mg Salicylic acid in a gel base with glycerin and propylene glycol.',
    indications: 'Acne vulgaris, comedones, mild seborrhoeic dermatitis, warts, keratosis pilaris.',
    dosage: 'Apply to affected areas once or twice daily after cleansing. Avoid eyes and mucous membranes.',
    sideEffects: 'Dryness, peeling, mild irritation. Use sunscreen as product may increase photosensitivity.',
    storage: 'Store at room temperature. Keep tube tightly capped.',
    isFeatured: false,
    tags: ['keratolytic', 'acne', 'salicylic-acid'],
    color: '#155e75',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@medicatalogue.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe@2024!'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // 2. Create products with placeholder images
  for (const product of PRODUCTS) {
    const slug = product.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .trim()

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      console.log(`⏭  Skipping "${product.name}" (exists)`)
      continue
    }

    const productId = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
    const imgDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId)
    const imgFile = `seed-${Date.now()}.webp`

    await createPlaceholder(imgDir, imgFile, product.color, product.genericName)

    const imgPath = `/uploads/products/${productId}/${imgFile}`
    const thumbPath = `/uploads/products/${productId}/thumb-${imgFile}`

    await prisma.product.create({
      data: {
        id: productId,
        name: product.name,
        slug,
        genericName: product.genericName,
        manufacturer: product.manufacturer,
        category: product.category,
        form: product.form,
        strength: product.strength,
        packSize: product.packSize,
        description: product.description,
        composition: product.composition,
        indications: product.indications,
        dosage: product.dosage,
        sideEffects: product.sideEffects,
        storage: product.storage,
        isFeatured: product.isFeatured,
        isActive: true,
        tags: product.tags,
        images: [{ original: imgPath, thumb: thumbPath }],
      },
    })

    console.log(`✅ Created: ${product.name}`)
  }

  // 3. Audit log for seed
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE',
      target: 'Database seed',
      details: `Seeded ${PRODUCTS.length} sample products`,
      ip: '127.0.0.1',
    },
  })

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────────')
  console.log(`Admin email:    ${adminEmail}`)
  console.log(`Admin password: ${adminPassword}`)
  console.log('⚠️  Change the admin password after first login!')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
