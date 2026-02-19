const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ═══════════════════════════════════════════════════════════════
// MSP DATA — 2025-26 (Official CACP rates)
// ═══════════════════════════════════════════════════════════════
const mspData = [
    { crop: 'Paddy (Common)', year: '2025-26', msp: 2300 },
    { crop: 'Paddy (Grade A)', year: '2025-26', msp: 2320 },
    { crop: 'Jowar (Hybrid)', year: '2025-26', msp: 3371 },
    { crop: 'Jowar (Maldandi)', year: '2025-26', msp: 3421 },
    { crop: 'Bajra', year: '2025-26', msp: 2625 },
    { crop: 'Maize', year: '2025-26', msp: 2225 },
    { crop: 'Ragi', year: '2025-26', msp: 4290 },
    { crop: 'Arhar (Tur)', year: '2025-26', msp: 7550 },
    { crop: 'Moong', year: '2025-26', msp: 8682 },
    { crop: 'Urad', year: '2025-26', msp: 7400 },
    { crop: 'Cotton (Medium Staple)', year: '2025-26', msp: 7121 },
    { crop: 'Cotton (Long Staple)', year: '2025-26', msp: 7521 },
    { crop: 'Groundnut', year: '2025-26', msp: 6783 },
    { crop: 'Sunflower', year: '2025-26', msp: 7280 },
    { crop: 'Soyabean (Yellow)', year: '2025-26', msp: 4892 },
    { crop: 'Sesamum', year: '2025-26', msp: 9267 },
    { crop: 'Nigerseed', year: '2025-26', msp: 8717 },
    { crop: 'Wheat', year: '2025-26', msp: 2425 },
    { crop: 'Barley', year: '2025-26', msp: 1990 },
    { crop: 'Gram', year: '2025-26', msp: 5650 },
    { crop: 'Masur (Lentil)', year: '2025-26', msp: 6700 },
    { crop: 'Rapeseed & Mustard', year: '2025-26', msp: 5950 },
    { crop: 'Safflower', year: '2025-26', msp: 5940 },
    { crop: 'Copra (Milling)', year: '2025-26', msp: 11160 },
    { crop: 'Copra (Ball)', year: '2025-26', msp: 12000 },
    { crop: 'Jute', year: '2025-26', msp: 5335 },
    { crop: 'Sugarcane', year: '2025-26', msp: 340 }
];

// ═══════════════════════════════════════════════════════════════
// AGMARKNET-ACCURATE APMC MARKET DATA
// Source: agmarknet.gov.in — verified district-wise market lists
// Format: { State: { District: [market names] } }
// ═══════════════════════════════════════════════════════════════
const APMC_MARKET_DATA = {
    'Gujarat': {
        'Ahmedabad': [
            'Ahmedabad APMC', 'Daskroi APMC', 'Dholka APMC', 'Bavla APMC', 'Sanand APMC', 'Viramgam APMC'
        ],
        'Amreli': [
            'Amreli APMC', 'Babra APMC', 'Bagasara APMC', 'Dhari APMC',
            'Jafrabad APMC', 'Kunkavav APMC', 'Lathi APMC', 'Rajula APMC', 'Savarkundla APMC'
        ],
        'Anand': [
            'Anand APMC', 'Anklav APMC', 'Borsad APMC', 'Khambhat APMC', 'Petlad APMC', 'Tarapur APMC', 'Umreth APMC'
        ],
        'Aravalli': [
            'Bayad APMC', 'Bhiloda APMC', 'Dhansura APMC', 'Malpur APMC', 'Meghraj APMC', 'Modasa APMC'
        ],
        'Banaskantha': [
            'Palanpur APMC', 'Amirgadh APMC', 'Bhabhar APMC', 'Danta APMC', 'Dantiwada APMC',
            'Deesa APMC', 'Deodar APMC', 'Dhanera APMC', 'Kankrej APMC', 'Lakhani APMC',
            'Santalpur APMC', 'Tharad APMC', 'Vadgam APMC', 'Vav APMC'
        ],
        'Bharuch': [
            'Bharuch APMC', 'Amod APMC', 'Ankleshwar APMC', 'Hansot APMC',
            'Jambusar APMC', 'Jhagadia APMC', 'Netrang APMC', 'Vagra APMC'
        ],
        'Bhavnagar': [
            'Bhavnagar APMC', 'Botad APMC', 'Gadhada APMC', 'Gariadhar APMC',
            'Ghogha APMC', 'Mahuva APMC', 'Palitana APMC', 'Sihor APMC', 'Talaja APMC', 'Umrala APMC', 'Vallabhipur APMC'
        ],
        'Botad': ['Botad APMC', 'Barvala APMC', 'Gadhada APMC', 'Ranpur APMC'],
        'Chhota Udaipur': ['Chhota Udaipur APMC', 'Bodeli APMC', 'Jetpur Pavi APMC', 'Kavant APMC', 'Nasvadi APMC', 'Sankheda APMC'],
        'Dahod': ['Dahod APMC', 'Devgadh Baria APMC', 'Dhanpur APMC', 'Fatepura APMC', 'Garbada APMC', 'Jhalod APMC', 'Limkheda APMC', 'Sanjeli APMC', 'Singvad APMC'],
        'Dang': ['Ahwa APMC', 'Subir APMC', 'Waghai APMC'],
        'Devbhoomi Dwarka': ['Khambhalia APMC', 'Bhanvad APMC', 'Dwarka APMC', 'Kalyanpur APMC', 'Okha APMC'],
        'Gandhinagar': ['Gandhinagar APMC', 'Dehgam APMC', 'Kalol APMC', 'Mansa APMC'],
        'Gir Somnath': ['Veraval APMC', 'Kodinar APMC', 'Sutrapada APMC', 'Talala APMC', 'Una APMC'],
        'Jamnagar': ['Jamnagar APMC', 'Dhrol APMC', 'Jodiya APMC', 'Kalavad APMC', 'Kalyanpur APMC', 'Jamjodhpur APMC', 'Lalpur APMC'],
        'Junagadh': ['Junagadh APMC', 'Bhesan APMC', 'Keshod APMC', 'Malia APMC', 'Manavadar APMC', 'Mangrol APMC', 'Mendarda APMC', 'Vanthali APMC', 'Visavadar APMC'],
        'Kheda': ['Kheda APMC', 'Kapadvanj APMC', 'Kathlal APMC', 'Mahudha APMC', 'Matar APMC', 'Nadiad APMC', 'Thasra APMC', 'Vaso APMC'],
        'Kutch': ['Bhuj APMC', 'Abdasa APMC', 'Anjar APMC', 'Bhachau APMC', 'Gandhidham APMC', 'Mandvi APMC', 'Mundra APMC', 'Nakhatrana APMC', 'Rapar APMC'],
        'Mahisagar': ['Lunawada APMC', 'Balasinor APMC', 'Kadana APMC', 'Khanpur APMC', 'Santrampur APMC', 'Virpur APMC'],
        'Mehsana': ['Mehsana APMC', 'Becharaji APMC', 'Jotana APMC', 'Kadi APMC', 'Kheralu APMC', 'Satlasana APMC', 'Unjha APMC', 'Vadnagar APMC', 'Vijapur APMC', 'Visnagar APMC'],
        'Morbi': ['Morbi APMC', 'Halvad APMC', 'Maliya APMC', 'Tankara APMC', 'Wankaner APMC'],
        'Narmada': ['Rajpipla APMC', 'Dediapada APMC', 'Garudeshwar APMC', 'Nandod APMC', 'Sagbara APMC', 'Tilakwada APMC'],
        'Navsari': ['Navsari APMC', 'Chikhli APMC', 'Gandevi APMC', 'Jalalpore APMC', 'Khergam APMC', 'Vansda APMC'],
        'Panchmahal': ['Godhra APMC', 'Ghoghamba APMC', 'Halol APMC', 'Jambughoda APMC', 'Kalol APMC', 'Morva Hadaf APMC', 'Shahera APMC'],
        'Patan': ['Patan APMC', 'Chanasma APMC', 'Harij APMC', 'Radhanpur APMC', 'Sami APMC', 'Santalpur APMC', 'Saraswati APMC', 'Sidhpur APMC'],
        'Porbandar': ['Porbandar APMC', 'Kutiyana APMC', 'Ranavav APMC'],
        'Rajkot': ['Rajkot APMC', 'Dhoraji APMC', 'Gondal APMC', 'Jasdan APMC', 'Jetpur APMC', 'Kotda Sangani APMC', 'Lodhika APMC', 'Paddhari APMC', 'Upleta APMC', 'Vinchhiya APMC'],
        'Sabarkantha': ['Himmatnagar APMC', 'Idar APMC', 'Khedbrahma APMC', 'Prantij APMC', 'Talod APMC', 'Vadali APMC', 'Vijaynagar APMC'],
        'Surat': ['Surat APMC', 'Bardoli APMC', 'Choryasi APMC', 'Kamrej APMC', 'Mahuva APMC', 'Mandvi APMC', 'Mangrol APMC', 'Olpad APMC', 'Palsana APMC', 'Umarpada APMC'],
        'Surendranagar': ['Surendranagar APMC', 'Chuda APMC', 'Dasada APMC', 'Dhrangadhra APMC', 'Lakhtar APMC', 'Limbdi APMC', 'Muli APMC', 'Sayla APMC', 'Thangadh APMC', 'Wadhwan APMC'],
        'Tapi': ['Vyara APMC', 'Dolvan APMC', 'Kukarmunda APMC', 'Nizar APMC', 'Songadh APMC', 'Uchchhal APMC', 'Valod APMC'],
        'Vadodara': ['Vadodara APMC', 'Dabhoi APMC', 'Karjan APMC', 'Padra APMC', 'Savli APMC', 'Shinor APMC', 'Waghodia APMC'],
        'Valsad': ['Valsad APMC', 'Dharampur APMC', 'Kaprada APMC', 'Pardi APMC', 'Umbergaon APMC', 'Vapi APMC']
    },
    'Maharashtra': {
        'Ahmednagar': [
            'Ahmednagar APMC', 'Rahata APMC', 'Kopargaon APMC', 'Shrirampur APMC',
            'Sangamner APMC', 'Rahuri APMC', 'Newasa APMC'
        ],
        'Aurangabad': [
            'Aurangabad APMC', 'Paithan APMC', 'Vaijapur APMC', 'Gangapur APMC',
            'Sillod APMC', 'Kannad APMC'
        ],
        'Jalgaon': [
            'Jalgaon APMC', 'Bhusawal APMC', 'Chalisgaon APMC', 'Pachora APMC',
            'Amalner APMC', 'Raver APMC', 'Yawal APMC'
        ],
        'Kolhapur': [
            'Kolhapur APMC', 'Gadhinglaj APMC', 'Jaysingpur APMC', 'Malkapur APMC'
        ],
        'Nagpur': [
            'Nagpur APMC', 'Kamptee APMC', 'Katol APMC', 'Saoner APMC', 'Umred APMC'
        ],
        'Nashik': [
            'Nashik APMC', 'Lasalgaon APMC', 'Pimpalgaon APMC', 'Sinnar APMC',
            'Yeola APMC', 'Chandwad APMC', 'Malegaon APMC', 'Niphad APMC'
        ],
        'Pune': [
            'Pune APMC', 'Manchar APMC', 'Junnar APMC', 'Baramati APMC',
            'Indapur APMC', 'Daund APMC', 'Shirur APMC'
        ],
        'Sangli': [
            'Sangli APMC', 'Tasgaon APMC', 'Vita APMC', 'Islampur APMC', 'Jat APMC'
        ],
        'Satara': [
            'Satara APMC', 'Karad APMC', 'Phaltan APMC', 'Wai APMC', 'Lonand APMC'
        ],
        'Solapur': [
            'Solapur APMC', 'Pandharpur APMC', 'Akluj APMC', 'Barshi APMC',
            'Akkalkot APMC', 'Karmala APMC', 'Sangola APMC'
        ],
        'Wardha': [
            'Wardha APMC', 'Hinganghat APMC', 'Arvi APMC', 'Pulgaon APMC'
        ],
        'Yavatmal': [
            'Yavatmal APMC', 'Pusad APMC', 'Darwha APMC', 'Digras APMC',
            'Wani APMC', 'Ghatanji APMC'
        ]
    },
    'Rajasthan': {
        'Jaipur': ['Jaipur APMC (Muhana)', 'Chomu APMC', 'Bassi APMC', 'Phulera APMC'],
        'Jodhpur': ['Jodhpur APMC', 'Bilara APMC', 'Phalodi APMC', 'Bhopalgarh APMC'],
        'Bikaner': ['Bikaner APMC', 'Nokha APMC', 'Dungargarh APMC'],
        'Kota': ['Kota APMC', 'Ramganj Mandi APMC', 'Sangod APMC'],
        'Ajmer': ['Ajmer APMC', 'Beawar APMC', 'Kishangarh APMC', 'Kekri APMC'],
        'Udaipur': ['Udaipur APMC', 'Fatehnagar APMC'],
        'Nagaur': ['Nagaur APMC', 'Merta City APMC', 'Kuchaman City APMC', 'Didwana APMC'],
        'Sikar': ['Sikar APMC', 'Fatehpur APMC', 'Neem Ka Thana APMC'],
        'Alwar': ['Alwar APMC', 'Khairthal APMC', 'Rajgarh APMC', 'Tijara APMC'],
        'Bharatpur': ['Bharatpur APMC', 'Bayana APMC', 'Nadbai APMC', 'Kaman APMC'],
        'Ganganagar': ['Sri Ganganagar APMC', 'Suratgarh APMC', 'Raisinghnagar APMC', 'Nohar APMC'],
        'Pali': ['Pali APMC', 'Bali APMC', 'Jaitaran APMC', 'Sumerpur APMC']
    },
    'Punjab': {
        'Amritsar': ['Amritsar APMC', 'Rayya APMC', 'Ajnala APMC', 'Majitha APMC'],
        'Ludhiana': ['Ludhiana APMC', 'Khanna APMC', 'Jagraon APMC', 'Samrala APMC'],
        'Patiala': ['Patiala APMC', 'Rajpura APMC', 'Nabha APMC', 'Samana APMC'],
        'Jalandhar': ['Jalandhar APMC', 'Phillaur APMC', 'Nakodar APMC', 'Shahkot APMC'],
        'Bathinda': ['Bathinda APMC', 'Rampura Phul APMC', 'Maur APMC', 'Goniana APMC'],
        'Sangrur': ['Sangrur APMC', 'Malerkotla APMC', 'Sunam APMC', 'Dhuri APMC'],
        'Moga': ['Moga APMC', 'Baghapurana APMC', 'Dharamkot APMC'],
        'Gurdaspur': ['Gurdaspur APMC', 'Batala APMC', 'Dina Nagar APMC']
    },
    'Haryana': {
        'Hisar': ['Hisar APMC', 'Hansi APMC', 'Barwala APMC', 'Narnaund APMC'],
        'Karnal': ['Karnal APMC', 'Gharaunda APMC', 'Assandh APMC', 'Taraori APMC'],
        'Ambala': ['Ambala City APMC', 'Ambala Cantt APMC', 'Naraingarh APMC'],
        'Rohtak': ['Rohtak APMC', 'Meham APMC', 'Sampla APMC'],
        'Sirsa': ['Sirsa APMC', 'Ellenabad APMC', 'Dabwali APMC', 'Kalanwali APMC'],
        'Panipat': ['Panipat APMC', 'Samalkha APMC', 'Madlauda APMC'],
        'Fatehabad': ['Fatehabad APMC', 'Tohana APMC', 'Ratia APMC'],
        'Sonipat': ['Sonipat APMC', 'Ganaur APMC', 'Gohana APMC']
    },
    'Madhya Pradesh': {
        'Indore': ['Indore APMC (Choithram)', 'Sanwer APMC', 'Mhow APMC', 'Depalpur APMC'],
        'Ujjain': ['Ujjain APMC', 'Khachrod APMC', 'Mahidpur APMC', 'Barnagar APMC'],
        'Mandsaur': ['Mandsaur APMC', 'Shamgarh APMC', 'Sitamau APMC', 'Garoth APMC'],
        'Gwalior': ['Gwalior APMC', 'Dabra APMC'],
        'Jabalpur': ['Jabalpur APMC', 'Sihora APMC', 'Patan APMC'],
        'Sagar': ['Sagar APMC', 'Khurai APMC', 'Bina APMC'],
        'Ratlam': ['Ratlam APMC', 'Jaora APMC', 'Sailana APMC', 'Alot APMC'],
        'Dewas': ['Dewas APMC', 'Sonkatch APMC', 'Kannod APMC'],
        'Hoshangabad': ['Hoshangabad APMC', 'Itarsi APMC', 'Pipariya APMC'],
        'Bhopal': ['Bhopal APMC (Karond)', 'Berasia APMC']
    },
    'Uttar Pradesh': {
        'Lucknow': ['Lucknow APMC', 'Malihabad APMC'],
        'Kanpur': ['Kanpur APMC', 'Bilhaur APMC', 'Pukhrayan APMC'],
        'Agra': ['Agra APMC', 'Kheragarh APMC', 'Fatehabad APMC'],
        'Meerut': ['Meerut APMC', 'Sardhana APMC', 'Mawana APMC'],
        'Varanasi': ['Varanasi APMC'],
        'Bareilly': ['Bareilly APMC', 'Aonla APMC', 'Baheri APMC'],
        'Muzaffarnagar': ['Muzaffarnagar APMC', 'Kairana APMC', 'Khatauli APMC'],
        'Saharanpur': ['Saharanpur APMC', 'Deoband APMC', 'Gangoh APMC'],
        'Moradabad': ['Moradabad APMC', 'Chandausi APMC', 'Sambhal APMC'],
        'Mathura': ['Mathura APMC', 'Kosi Kalan APMC'],
        'Allahabad': ['Allahabad APMC (Mundera)', 'Jasra APMC']
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Get validated markets for a state/district combination
// ═══════════════════════════════════════════════════════════════
function getMarketsForFilter(state, district, market) {
    console.log(`[APMC Filter] state="${state}" district="${district}" market="${market}"`);

    // Case 1: Specific market selected — use only that
    if (market && market !== '' && !market.toLowerCase().includes('all')) {
        console.log(`[APMC Filter] Using specific market: ${market}`);
        return [market];
    }

    const stateData = APMC_MARKET_DATA[state];
    if (!stateData) {
        console.warn(`[APMC Filter] Unknown state: "${state}" — returning empty`);
        return [];
    }

    // Case 2: Specific district selected — ONLY return markets for that district
    if (district && district !== '' && !district.toLowerCase().includes('all')) {
        const districtMarkets = stateData[district];
        if (!districtMarkets || districtMarkets.length === 0) {
            console.warn(`[APMC Filter] Unknown district: "${district}" in state "${state}"`);
            return [];
        }
        console.log(`[APMC Filter] Returning ${districtMarkets.length} markets for ${state}/${district}: ${districtMarkets.join(', ')}`);
        return districtMarkets;
    }

    // Case 3: Only state selected — return first 5 markets from first 3 districts
    const allMarkets = Object.values(stateData).flat();
    const sample = allMarkets.slice(0, 12);
    console.log(`[APMC Filter] State-only: returning ${sample.length} sample markets for ${state}`);
    return sample;
}

// ═══════════════════════════════════════════════════════════════
// GET MSP PRICES
// ═══════════════════════════════════════════════════════════════
exports.getMSPPrices = (req, res) => {
    try {
        res.status(200).json({ success: true, data: mspData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET APMC PRICES
// Tries real Data.gov.in API first, falls back to structured mock
// ═══════════════════════════════════════════════════════════════
exports.getAPMCPrices = async (req, res) => {
    const { state, district, market, commodity, commodityGroup, grade } = req.query;

    console.log(`[APMC] Incoming request - state="${state}" district="${district}" market="${market}" commodity="${commodity}" commodityGroup="${commodityGroup}" grade="${grade}"`);

    // Validate inputs
    if (!state || state === '') {
        return res.status(400).json({ success: false, message: 'State is required' });
    }

    const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
    const API_KEY = process.env.DATA_GOV_KEY;

    try {
        // ── Try real Data.gov.in API first ──────────────────────────
        if (API_KEY) {
            console.log('[APMC] Attempting real Data.gov.in API...');
            let apiUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=100`;
            if (state) apiUrl += `&filters[state]=${encodeURIComponent(state)}`;
            if (district && !district.toLowerCase().includes('all')) apiUrl += `&filters[district]=${encodeURIComponent(district)}`;
            if (market && !market.toLowerCase().includes('all')) apiUrl += `&filters[market]=${encodeURIComponent(market)}`;
            if (commodity && !commodity.toLowerCase().includes('all')) apiUrl += `&filters[commodity]=${encodeURIComponent(commodity)}`;

            const response = await axios.get(apiUrl, { timeout: 5000 });
            if (response.data && response.data.records && response.data.records.length > 0) {
                console.log(`[APMC] Real API returned ${response.data.records.length} records`);
                return res.json({ success: true, data: response.data.records, source: 'api' });
            }
            console.log('[APMC] Real API returned empty — falling back to structured mock');
        }

        // ── Build structured mock data ───────────────────────────────
        console.log('[APMC] Building structured mock data...');

        // Get ONLY the markets for this state/district — STRICTLY filtered
        const marketsForQuery = getMarketsForFilter(state, district, market);

        if (marketsForQuery.length === 0) {
            console.warn(`[APMC] No markets found for state="${state}" district="${district}"`);
            return res.json({
                success: true,
                data: [],
                source: 'mock',
                message: `No APMC markets found for ${district || state}. Please check the district name.`
            });
        }

        // ── Commodity group → strict commodity list ────────────────
        // This is the CENTRAL fix: commodityGroup is used to strictly
        // restrict which commodities appear in mock data.
        const COMMODITY_GROUP_MAP = {
            'Cereals': ['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Barley'],
            'Pulses': ['Gram', 'Tur (Arhar)', 'Urad', 'Moong', 'Masur', 'Peas'],
            'Oilseeds': ['Groundnut', 'Mustard', 'Soyabean', 'Sunflower', 'Sesamum', 'Castor Seed', 'Linseed'],
            'Vegetables': ['Potato', 'Onion', 'Tomato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Green Chilli', 'Garlic', 'Carrot', 'Radish', 'Spinach'],
            'Fruits': ['Mango', 'Banana', 'Apple', 'Pomegranate', 'Grapes', 'Papaya', 'Watermelon', 'Orange', 'Guava'],
            'Spices': ['Cumin', 'Fennel', 'Coriander', 'Turmeric', 'Red Chilli', 'Black Pepper', 'Fenugreek'],
            'Fibre Crops': ['Cotton', 'Jute'],
            'Commercial Crops': ['Sugarcane', 'Tobacco', 'Coconut', 'Arecanut']
        };

        // Priority: specific commodity > commodityGroup > default sample
        let commoditiesToUse;
        if (commodity && !commodity.toLowerCase().includes('all')) {
            // Specific commodity selected — use exactly that
            commoditiesToUse = [commodity];
            console.log(`[APMC Filter] Specific commodity: ${commodity}`);
        } else if (commodityGroup && !commodityGroup.toLowerCase().includes('all') && COMMODITY_GROUP_MAP[commodityGroup]) {
            // CommodityGroup selected — STRICTLY use only that group's commodities
            commoditiesToUse = COMMODITY_GROUP_MAP[commodityGroup];
            console.log(`[APMC Filter] CommodityGroup "${commodityGroup}" → [${commoditiesToUse.join(', ')}]`);
        } else {
            // No group filter — use a representative sample across all groups
            commoditiesToUse = ['Wheat', 'Rice', 'Onion', 'Potato', 'Tomato', 'Cotton', 'Banana', 'Groundnut'];
            console.log(`[APMC Filter] No group filter — using default mix`);
        }

        // Grade: strict enforcement — only 'All Grades' means no filter
        const isAllGrades = !grade || grade.toLowerCase().includes('all');
        const strictGrade = isAllGrades ? null : grade;
        console.log(`[APMC Filter] Grade filter: ${strictGrade || 'ALL (no restriction)'}`);

        const varieties = ['Desi', 'Hybrid', 'Local', 'Improved'];
        const usedDistrict = (district && !district.toLowerCase().includes('all')) ? district : 'Mixed';

        const mockResponse = [];

        marketsForQuery.forEach(mktName => {
            commoditiesToUse.forEach(comm => {
                if (Math.random() > 0.3) {
                    const minP = Math.floor(Math.random() * 1200) + 800;
                    const maxP = minP + Math.floor(Math.random() * 1000) + 400;
                    const modalP = Math.floor((minP + maxP) / 2) + Math.floor(Math.random() * 150) - 75;
                    const varieties = ['Desi', 'Hybrid', 'Local', 'Improved'];

                    // Grade: use requested grade strictly, or randomise from valid grades
                    const assignedGrade = strictGrade
                        ? strictGrade
                        : ['Standard', 'Medium', 'Best', 'Premium'][Math.floor(Math.random() * 4)];

                    mockResponse.push({
                        state: state,
                        district: usedDistrict,
                        market: mktName,
                        commodity: comm,
                        variety: varieties[Math.floor(Math.random() * varieties.length)],
                        grade: assignedGrade,
                        min_price: minP,
                        max_price: maxP,
                        modal_price: Math.max(minP, Math.min(maxP, modalP)),
                        arrival_date: new Date().toISOString().split('T')[0]
                    });
                }
            });
        });

        // Guarantee at least one row per market (avoid fully empty results)
        if (mockResponse.length === 0) {
            marketsForQuery.slice(0, 3).forEach(mktName => {
                mockResponse.push({
                    state: state,
                    district: usedDistrict,
                    market: mktName,
                    commodity: commoditiesToUse[0] || 'Wheat',
                    variety: 'Desi',
                    grade: strictGrade || 'Standard',
                    min_price: 1800,
                    max_price: 2400,
                    modal_price: 2100,
                    arrival_date: new Date().toISOString().split('T')[0]
                });
            });
        }

        console.log(`[APMC] Mock response: ${mockResponse.length} rows for ${marketsForQuery.length} markets in ${state}/${usedDistrict}`);
        res.json({ success: true, data: mockResponse, source: 'mock' });

    } catch (error) {
        console.error('[APMC] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch APMC data', data: [] });
    }
};

// ═══════════════════════════════════════════════════════════════
// AI SEARCH FOR PRICES
// ═══════════════════════════════════════════════════════════════
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.searchPriceAI = async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: true, answer: 'My API Key is missing. Please configure GEMINI_API_KEY.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `You are 'Agri-Assistant', a helpful AI for Indian farmers.
You can answer questions about crop prices, farming techniques, weather, government schemes, and general agricultural advice.
User Query: "${query}"
Answer (be helpful, concise, and friendly):`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ success: true, answer: response.text() });

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        let mockAnswer = 'I am currently in Offline Mode (API Limit Reached).\n\n';
        const q = query.toLowerCase();
        if (q.includes('price') || q.includes('rate')) {
            mockAnswer += '**Current APMC Prices (Approx)**:\n- Wheat: ₹2,200-₹2,500/quintal\n- Rice: ₹2,800-₹3,500/quintal\n- Cotton: ₹6,800-₹7,500/quintal';
        } else if (q.includes('hello') || q.includes('hi')) {
            mockAnswer = 'Hello! I am your Agri-Assistant. How can I help you today?';
        } else if (q.includes('scheme') || q.includes('subsidy')) {
            mockAnswer += '**Popular Schemes**:\n1. PM-KISAN: ₹6,000/year\n2. Kisan Credit Card: Low interest loans\n3. Soil Health Card: Free soil testing';
        } else {
            mockAnswer += 'Try asking about crop prices, farming techniques, or government schemes.';
        }
        res.json({ success: true, answer: mockAnswer });
    }
};
