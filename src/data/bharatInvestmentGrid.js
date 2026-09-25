const imagePath = (slug) => `/images/bharat-investment-grid/states/${slug}.jpg`

const heroContent = {
  'andhra-pradesh': {
    shortWriteup: 'With a long eastern coastline and productive agricultural hinterland, Andhra Pradesh connects maritime trade, food systems and expanding urban centres. Its ports, manufacturing base and technical talent support opportunities in logistics, electronics, renewable energy, food processing and export-oriented industry.',
    heroImageAlt: 'Entrance to Hindustan Shipyard in Visakhapatnam, reflecting Andhra Pradesh’s maritime industry', heroImagePosition: 'center 48%', imageSubject: 'Visakhapatnam maritime industry', imageCredit: 'Rams1966', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:What_is_Shipyard.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  'arunachal-pradesh': {
    shortWriteup: 'Arunachal Pradesh’s Himalayan setting, river systems and distinctive cultural traditions shape an economy rooted in agriculture, crafts, tourism and renewable resources. Its frontier location and natural assets offer scope for responsible infrastructure, sustainable tourism, horticulture and carefully planned clean-energy development.',
    heroImageAlt: 'Tawang Monastery set against the mountain landscape of Arunachal Pradesh', heroImagePosition: 'center 42%', imageSubject: 'Tawang Monastery', imageCredit: 'Rumelade', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:TawangMonastery.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  assam: {
    shortWriteup: 'Assam is the commercial gateway to much of North-East India, shaped by the Brahmaputra valley, tea country and rich biodiversity. Its agricultural production, energy resources and regional connections create opportunities in food processing, logistics, healthcare, tourism and value-added natural products.',
    heroImageAlt: 'Green tea garden rows across the landscape of Dibrugarh in Assam', heroImagePosition: 'center 52%', imageSubject: 'Dibrugarh tea gardens', imageCredit: 'Nborkakoty', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:A_tea_garden_in_Dibrugarh.jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  bihar: {
    shortWriteup: 'Bihar combines fertile plains, a young workforce and an exceptional heritage of learning and pilgrimage. Its agricultural depth and position along major eastern transport routes support opportunities in food processing, logistics, textiles, tourism, education-linked services and light manufacturing.',
    heroImageAlt: 'Mahabodhi Temple at Bodh Gaya representing Bihar’s historic and cultural identity', heroImagePosition: 'center 38%', imageSubject: 'Mahabodhi Temple', imageCredit: 'Bpilgrim', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Mahabodhitemple.jpg', imageLicense: 'CC BY-SA 2.5', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5',
  },
  chhattisgarh: {
    shortWriteup: 'Chhattisgarh brings together forested landscapes, mineral resources, agricultural communities and established industrial centres. Its central-eastern location and resource base offer pathways for value-added manufacturing, renewable energy, food processing, nature-based tourism and infrastructure that strengthens regional supply chains.',
    heroImageAlt: 'Chitrakote Falls flowing through the forested landscape of Chhattisgarh', heroImagePosition: 'center 48%', imageSubject: 'Chitrakote Falls', imageCredit: 'Iamg', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Chitrakot_waterfalls.JPG', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  goa: {
    shortWriteup: 'Goa’s coastal setting, layered architectural heritage and international outlook support an economy extending beyond tourism into pharmaceuticals, technology, creative services and specialised manufacturing. Its compact scale and strong visitor identity create opportunities for sustainable hospitality, health industries and digital enterprise.',
    heroImageAlt: 'Basilica of Bom Jesus and historic architecture in Goa', heroImagePosition: 'center 46%', imageSubject: 'Basilica of Bom Jesus', imageCredit: 'iMahesh', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Front_Elevation_of_Basilica_of_Bom_Jesus.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  gujarat: {
    shortWriteup: 'Gujarat’s entrepreneurial culture, long coastline and industrial cities connect manufacturing centres with major trade gateways. Its strengths span engineering, chemicals, logistics, renewable energy and emerging green technologies, creating a broad base for export-oriented production and infrastructure investment.',
    heroImageAlt: 'Sunset over the white salt landscape of the Rann of Kutch in Gujarat', heroImagePosition: 'center 58%', imageSubject: 'Rann of Kutch', imageCredit: 'NandaMunish', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Sunset_at_Rann_of_Kutch,_Dhordo,_Gujarat.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  haryana: {
    shortWriteup: 'Haryana links productive agricultural districts with the corporate and technology centres of the National Capital Region. Its automotive clusters, logistics corridors and growing services economy create opportunities across advanced manufacturing, mobility, warehousing, food processing and enterprise technology.',
    heroImageAlt: 'Modern Cyber City business district in Gurugram, Haryana', heroImagePosition: 'center 48%', imageSubject: 'Gurugram skyline', imageCredit: 'Tarun4u', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Cyber_City_View.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  'himachal-pradesh': {
    shortWriteup: 'Himachal Pradesh’s mountain geography supports a distinctive economy built around horticulture, tourism, hydropower, pharmaceuticals and specialised manufacturing. Its hill towns and natural landscapes offer opportunities for responsible visitor infrastructure, life sciences, clean energy and high-value agricultural products.',
    heroImageAlt: 'Mountain city landscape of Shimla in Himachal Pradesh', heroImagePosition: 'center 48%', imageSubject: 'Shimla mountain landscape', imageCredit: 'Navneet Sharma', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Landscape_of_Shimla_,_Himachal_Pradesh.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  jharkhand: {
    shortWriteup: 'Jharkhand combines mineral wealth and established industrial centres with extensive forests, waterfalls and agricultural communities. The State’s productive base offers opportunities to deepen value-added manufacturing, build cleaner energy systems, modernise infrastructure and develop responsible nature and cultural tourism.',
    heroImageAlt: 'Dassam Falls flowing through the rocky landscape of Jharkhand', heroImagePosition: 'center 45%', imageSubject: 'Dassam Falls', imageCredit: 'Samratbit', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Dassam_falls.jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  karnataka: {
    shortWriteup: 'Karnataka brings together Bengaluru’s technology and research ecosystem, major manufacturing clusters, productive farmland and renowned heritage destinations. This diversity supports investment across semiconductors, electronics, aerospace, mobility, biotechnology, renewable energy and innovation-led services, backed by deep technical talent and global business connections.',
    heroImageAlt: 'Vidhana Soudha in Bengaluru representing Karnataka’s civic and architectural identity', heroImagePosition: 'center 44%', imageSubject: 'Vidhana Soudha', imageCredit: 'Muhammad Mahdi Karim and Mydreamsparrow', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Vidhana_Soudha_2012.jpg', imageLicense: 'GFDL 1.2', imageLicenseUrl: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html',
  },
  kerala: {
    shortWriteup: 'Kerala’s coastal geography, backwaters, skilled workforce and strong social infrastructure shape a service-rich economy with global connections. Opportunities extend across healthcare, tourism, food processing, marine industries, technology services and sustainable solutions adapted to dense urban and coastal environments.',
    heroImageAlt: 'Traditional houseboat crossing the backwaters of Kerala', heroImagePosition: 'center 52%', imageSubject: 'Kerala backwaters', imageCredit: 'Augustus Binu', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:House_Boat_DSW.jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  'madhya-pradesh': {
    shortWriteup: 'Known as the Heart of India, Madhya Pradesh combines a strategic central location with rich cultural heritage, diverse natural resources and a strong agricultural base. Its growing industrial ecosystem and improving connectivity create opportunities across renewable energy, food processing, manufacturing, logistics and tourism.',
    heroImageAlt: 'Great Stupa and eastern gateway at Sanchi representing the heritage of Madhya Pradesh', heroImagePosition: 'center 44%', imageSubject: 'Sanchi Stupa', imageCredit: 'Biswarup Ganguly', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:East_Gateway_-_Stupa_1_-_Sanchi_Hill_2013-02-21_4398.JPG', imageLicense: 'CC BY 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/3.0',
  },
  maharashtra: {
    shortWriteup: 'Maharashtra connects India’s leading financial and commercial centre with major industrial belts, ports, agricultural regions and creative industries. Its diverse economy supports opportunities in manufacturing, electric mobility, technology, logistics, financial services, life sciences and urban infrastructure.',
    heroImageAlt: 'Gateway of India on the Mumbai waterfront in Maharashtra', heroImagePosition: 'center 46%', imageSubject: 'Gateway of India', imageCredit: 'A. Savin', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Mumbai_03-2016_30_Gateway_of_India.jpg', imageLicense: 'Free Art License', imageLicenseUrl: 'https://artlibre.org/licence/lal/en/',
  },
  manipur: {
    shortWriteup: 'Manipur’s valley and hill landscapes, craft traditions and location near international trade routes give it a distinctive role in the North-East. Opportunities centre on sustainable tourism, food processing, handloom and textiles, sports-related enterprise and stronger regional logistics.',
    heroImageAlt: 'Floating wetlands and open water across Loktak Lake in Manipur', heroImagePosition: 'center 48%', imageSubject: 'Loktak Lake', imageCredit: 'Sudiptorana', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:The_Loktak_Lake.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  meghalaya: {
    shortWriteup: 'Meghalaya’s highland landscape, abundant rainfall and living cultural traditions underpin an economy shaped by horticulture, natural products and tourism. Careful investment can strengthen food processing, sustainable visitor infrastructure, logistics, creative enterprise and climate-resilient local value chains.',
    heroImageAlt: 'Living root bridge in Nongriat village, Meghalaya', heroImagePosition: 'center 50%', imageSubject: 'Living root bridge', imageCredit: 'Arshiya Urveeja Bose', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Living_root_bridges,_Nongriat_village,_Meghalaya2.jpg', imageLicense: 'CC BY 2.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  mizoram: {
    shortWriteup: 'Mizoram’s ridge-top settlements, forested terrain and close-knit communities shape a regional economy connected to horticulture, bamboo, food processing and cross-border commerce. Its landscape and cultural identity also support measured growth in tourism, creative industries and resilient infrastructure.',
    heroImageAlt: 'Aizawl’s hillside urban landscape and Mizoram Assembly building', heroImagePosition: 'center 48%', imageSubject: 'Aizawl hillside cityscape', imageCredit: 'GeoEvan', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Mizoram_Assembly_House_(wider_view).jpg', imageLicense: 'CC BY 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  },
  nagaland: {
    shortWriteup: 'Nagaland’s mountain landscapes, village traditions and celebrated craft and cultural practices give it a strong identity within the North-East. Opportunities include specialty agriculture, food processing, textiles, creative enterprise, sustainable tourism and infrastructure that improves market access for local producers.',
    heroImageAlt: 'Kisama Heritage Village landscape and traditional architecture in Nagaland', heroImagePosition: 'center 46%', imageSubject: 'Kisama Heritage Village', imageCredit: 'Aravind Manickam', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Kisama_main_arena_Hornbill_Festival_2019.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  odisha: {
    shortWriteup: 'Odisha combines a long coastline and port network with mineral resources, industrial centres, fertile districts and exceptional architectural heritage. These strengths create opportunities in manufacturing, logistics, renewable energy, food and marine processing, tourism and resilient coastal infrastructure.',
    heroImageAlt: 'Konark Sun Temple representing Odisha’s architectural heritage', heroImagePosition: 'center 44%', imageSubject: 'Konark Sun Temple', imageCredit: 'Subham9423', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Konarka_Temple.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  punjab: {
    shortWriteup: 'Punjab’s fertile agricultural landscape, entrepreneurial communities and established manufacturing towns support a broad productive economy. Opportunities include modern food processing, farm technology, textiles, light engineering, logistics and services that add value to its strong agricultural and industrial base.',
    heroImageAlt: 'Golden Temple and surrounding pool in Amritsar, Punjab', heroImagePosition: 'center 45%', imageSubject: 'Golden Temple', imageCredit: 'Shagil Kannur', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:The_Golden_Temple_of_Amrithsar_7.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  rajasthan: {
    shortWriteup: 'Rajasthan pairs a vast desert and mineral landscape with renowned forts, craft traditions and growing urban centres. Its scale and solar potential support opportunities in renewable energy, tourism, textiles, mining-linked manufacturing, logistics and water-efficient infrastructure.',
    heroImageAlt: 'Amber Fort rising above the historic landscape near Jaipur, Rajasthan', heroImagePosition: 'center 45%', imageSubject: 'Amber Fort', imageCredit: 'Jakub Hałun', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:20191219_Fort_Amber,_Amer,_Jaipur_0955_9481.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  sikkim: {
    shortWriteup: 'Sikkim’s Himalayan environment, organic farming traditions and Buddhist heritage shape a compact economy centred on tourism, horticulture and specialised services. Its strengths point to opportunities in wellness, premium food products, responsible hospitality, healthcare and climate-sensitive infrastructure.',
    heroImageAlt: 'Colourful monastery architecture at Rumtek near Gangtok, Sikkim', heroImagePosition: 'center 48%', imageSubject: 'Rumtek Monastery', imageCredit: 'Anjan Kumar Kundu', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Rumtek_Monastery_alias_Dharma_Chakra_Centre_near_Gangtok,_East_Sikkim_09.jpg', imageLicense: 'CC BY 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0',
  },
  'tamil-nadu': {
    shortWriteup: 'Tamil Nadu combines deep cultural heritage with one of India’s broadest manufacturing and services ecosystems. Its ports, industrial cities and skilled workforce support opportunities in automotive production, electronics, textiles, renewable energy, engineering, technology and export logistics.',
    heroImageAlt: 'Brihadisvara Temple illuminated at dusk in Tamil Nadu', heroImagePosition: 'center 47%', imageSubject: 'Brihadisvara Temple', imageCredit: 'Rainer Halama and UnpetitproleX', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_(edit).jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  telangana: {
    shortWriteup: 'Telangana brings Hyderabad’s technology and life-sciences economy together with manufacturing centres, agricultural districts and a distinctive Deccan heritage. The State offers opportunities across digital infrastructure, pharmaceuticals, healthcare, electronics, food processing and innovation-led urban services for domestic and international markets.',
    heroImageAlt: 'Charminar and the surrounding city streets in Hyderabad, Telangana', heroImagePosition: 'center 48%', imageSubject: 'Charminar', imageCredit: 'DidierTais', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Charminar_Hyderabad_1.jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  tripura: {
    shortWriteup: 'Tripura’s position near Bangladesh, productive agricultural land and cultural links across the eastern region give it growing strategic relevance. Opportunities include food processing, bamboo and rubber products, tourism, logistics, natural-gas-linked industry and infrastructure serving wider regional trade.',
    heroImageAlt: 'Ujjayanta Palace and museum in Agartala, Tripura', heroImagePosition: 'center 47%', imageSubject: 'Ujjayanta Palace', imageCredit: 'Sharada Prasad CS', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Ujjayanta_palace_Tripura_State_Museum_Agartala_India.jpg', imageLicense: 'CC BY 2.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  },
  'uttar-pradesh': {
    shortWriteup: 'Uttar Pradesh combines major cities, extensive agricultural districts, industrial corridors and globally recognised heritage. Its scale and connectivity support opportunities in electronics, food processing, logistics, tourism, textiles, urban infrastructure and a wide range of consumer and business services.',
    heroImageAlt: 'Historic red sandstone walls and architecture of Agra Fort in Uttar Pradesh', heroImagePosition: 'center 48%', imageSubject: 'Agra Fort', imageCredit: 'A. Savin', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Agra_03-2016_16_Agra_Fort.jpg', imageLicense: 'Free Art License', imageLicenseUrl: 'https://artlibre.org/licence/lal/en/',
  },
  uttarakhand: {
    shortWriteup: 'Uttarakhand’s Himalayan geography, river systems and pilgrimage and wellness destinations support an economy with strong natural and knowledge-based assets. Opportunities span responsible tourism, healthcare, pharmaceuticals, food products, renewable energy and resilient mountain infrastructure designed for sensitive terrain and local communities.',
    heroImageAlt: 'Kedarnath Temple beneath the Himalayan mountains in Uttarakhand', heroImagePosition: 'center 44%', imageSubject: 'Kedarnath Himalayan landscape', imageCredit: 'Shivam Kumar 766', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Kedarnath_Temple_in_Rainy_season.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  'west-bengal': {
    shortWriteup: 'West Bengal links the Kolkata metropolitan region and eastern ports with agricultural plains, tea districts and a wide cultural and industrial base. Its location supports opportunities in logistics, manufacturing, technology, textiles, food processing, tourism and regional trade services.',
    heroImageAlt: 'Howrah Bridge illuminated over the Hooghly River in Kolkata, West Bengal', heroImagePosition: 'center 52%', imageSubject: 'Howrah Bridge', imageCredit: 'Apoorva Karlekar', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Howrah_bridge_at_night.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  'andaman-and-nicobar-islands': {
    shortWriteup: 'The Andaman and Nicobar Islands occupy a strategic maritime position amid ecologically sensitive tropical landscapes. Their island economy calls for carefully managed opportunities in sustainable tourism, renewable energy, marine services, digital connectivity, logistics and resilient water and waste infrastructure.',
    heroImageAlt: 'Tropical beach and calm blue water at Havelock Island in the Andaman and Nicobar Islands', heroImagePosition: 'center 53%', imageSubject: 'Havelock Island coast', imageCredit: 'Dr. K. Vedhagiri', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Havelock,_Andaman_%26_Nicobar_Islands.JPG', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  chandigarh: {
    shortWriteup: 'Chandigarh’s planned urban form, modernist architecture and role as a regional administrative and service centre give it a distinctive economic profile. Its strengths support opportunities in healthcare, education, professional services, urban technology, design and high-quality city infrastructure.',
    heroImageAlt: 'Palace of Assembly at Chandigarh’s Capitol Complex', heroImagePosition: 'center 48%', imageSubject: 'Chandigarh Capitol Complex', imageCredit: 'duncid', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Palace_of_Assembly_Chandigarh_2006.jpg', imageLicense: 'CC BY-SA 2.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  'dadra-and-nagar-haveli-and-daman-and-diu': {
    shortWriteup: 'Dadra and Nagar Haveli and Daman and Diu combines compact industrial estates, coastal settlements and a layered trading heritage. Its location near major western markets supports opportunities in manufacturing, logistics, tourism, marine-linked services and modern infrastructure for small and medium enterprises.',
    heroImageAlt: 'Historic entrance to Diu Fort in Dadra and Nagar Haveli and Daman and Diu', heroImagePosition: 'center 46%', imageSubject: 'Diu Fort', imageCredit: 'Srinath G M', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Diu,Gujarat,India_(37).jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
  delhi: {
    shortWriteup: 'Delhi is India’s national capital and a major centre for policy, commerce, culture, education and international engagement. Its dense enterprise ecosystem and regional connectivity create opportunities in technology, healthcare, professional services, logistics, urban mobility and climate-resilient infrastructure.',
    heroImageAlt: 'India Gate illuminated in the evening in New Delhi', heroImagePosition: 'center 48%', imageSubject: 'India Gate', imageCredit: 'Incredible India Portal', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:India_Gate_in_the_Evening.jpg', imageLicense: 'CC0', imageLicenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'jammu-and-kashmir': {
    shortWriteup: 'Jammu and Kashmir’s mountain valleys, lakes, horticultural districts and craft traditions underpin a distinctive regional economy. Opportunities include responsible tourism, food and horticulture processing, textiles and handicrafts, healthcare, renewable energy and resilient logistics adapted to varied terrain.',
    heroImageAlt: 'Dal Lake and the Himalayan backdrop at Srinagar in Jammu and Kashmir', heroImagePosition: 'center 50%', imageSubject: 'Dal Lake', imageCredit: 'Suhail Skindar Sofi', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Dal_Lake_Hazratbal_Srinagar.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  ladakh: {
    shortWriteup: 'Ladakh’s high-altitude desert, solar potential and trans-Himalayan cultural heritage demand development suited to a fragile environment. Opportunities lie in clean energy, resilient infrastructure, responsible tourism, specialised agriculture, digital connectivity and cold-climate technologies designed for remote communities.',
    heroImageAlt: 'Thiksey Monastery overlooking the high-altitude landscape of Ladakh', heroImagePosition: 'center 48%', imageSubject: 'Thiksey Monastery', imageCredit: 'Aksveer', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Thikse_Monastery_.jpg', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  },
  lakshadweep: {
    shortWriteup: 'Lakshadweep’s small coral islands and lagoons support a highly specialised maritime economy within an ecologically sensitive setting. Carefully scaled opportunities include low-impact tourism, distributed renewable energy, fisheries value chains, water systems, digital connectivity and resilient island logistics.',
    heroImageAlt: 'Blue lagoon, palms and island resort landscape at Kadmat in Lakshadweep', heroImagePosition: 'center 52%', imageSubject: 'Kadmat Island lagoon', imageCredit: 'Manvendra Bhangui', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:A_beach_side_resort_at_Kadmat_Island,_Lakshadweep.jpg', imageLicense: 'CC BY-SA 2.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
  },
  puducherry: {
    shortWriteup: 'Puducherry combines a distinctive French-influenced urban heritage and coastal identity with compact manufacturing and education centres. Its scale and location support opportunities in sustainable tourism, technology services, specialised manufacturing, healthcare, food enterprise and resilient waterfront infrastructure.',
    heroImageAlt: 'Aerial view of Puducherry’s promenade, coastal neighbourhoods and Bay of Bengal shoreline', heroImagePosition: 'center 48%', imageSubject: 'Puducherry promenade and coast', imageCredit: 'Karthik Easvur', imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Pondicherry-Rock_beach_aerial_view.jpg', imageLicense: 'CC BY-SA 3.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
  },
}

const location = (slug, name, type, region, capital, keySectors, ideaHighlight, mapIds) => ({
  id: slug,
  slug,
  name,
  type,
  region,
  capital,
  keySectors,
  ideaHighlight,
  mapIds,
  ...heroContent[slug],
  heroImage: imagePath(slug),
  summary: heroContent[slug].shortWriteup,
})

// Single source of truth for Bharat Investment Grid location and opportunity content.
export const locations = [
  location('andhra-pradesh', 'Andhra Pradesh', 'state', 'South India', 'Amaravati', ['Food Processing', 'Electronics', 'Renewable Energy', 'Logistics'], 'Coastal logistics and value-added food processing.', ['ap']),
  location('arunachal-pradesh', 'Arunachal Pradesh', 'state', 'North-East India', 'Itanagar', ['Renewable Energy', 'Tourism', 'Agriculture'], 'Sustainable tourism and renewable-energy value chains.', ['ar']),
  location('assam', 'Assam', 'state', 'North-East India', 'Dispur', ['Food Processing', 'Logistics', 'Tourism', 'Healthcare'], 'Agri-processing and logistics serving the North-East.', ['as']),
  location('bihar', 'Bihar', 'state', 'East India', 'Patna', ['Agriculture', 'Food Processing', 'Textiles'], 'Agri-value chains and light manufacturing clusters.', ['br']),
  location('chhattisgarh', 'Chhattisgarh', 'state', 'Central India', 'Raipur', ['Manufacturing', 'Renewable Energy', 'Infrastructure'], 'Industrial infrastructure and clean-energy transition.', ['ct']),
  location('goa', 'Goa', 'state', 'West India', 'Panaji', ['Tourism', 'Technology', 'Pharmaceuticals'], 'Sustainable tourism and digital services.', ['ga']),
  location('gujarat', 'Gujarat', 'state', 'West India', 'Gandhinagar', ['Green Hydrogen', 'Manufacturing', 'Logistics', 'Renewable Energy'], 'Green hydrogen and export-oriented industrial infrastructure.', ['gj']),
  location('haryana', 'Haryana', 'state', 'North India', 'Chandigarh', ['Automotive', 'Logistics', 'Technology'], 'Advanced mobility and integrated logistics corridors.', ['hr']),
  location('himachal-pradesh', 'Himachal Pradesh', 'state', 'North India', 'Shimla', ['Tourism', 'Pharmaceuticals', 'Renewable Energy'], 'Responsible tourism and life-sciences manufacturing.', ['hp']),
  location('jharkhand', 'Jharkhand', 'state', 'East India', 'Ranchi', ['Manufacturing', 'Infrastructure', 'Renewable Energy'], 'Value-added manufacturing and resilient infrastructure.', ['jh']),
  location('karnataka', 'Karnataka', 'state', 'South India', 'Bengaluru', ['Technology', 'Electronics', 'Semiconductors', 'EV & Mobility'], 'Semiconductor, electronics and mobility innovation ecosystems.', ['ka']),
  location('kerala', 'Kerala', 'state', 'South India', 'Thiruvananthapuram', ['Healthcare', 'Tourism', 'Technology', 'Food Processing'], 'Health innovation and high-value sustainable tourism.', ['kl']),
  location('madhya-pradesh', 'Madhya Pradesh', 'state', 'Central India', 'Bhopal', ['Renewable Energy', 'Agriculture', 'Food Processing', 'Logistics'], 'Renewable-energy parks and central logistics networks.', ['mp']),
  location('maharashtra', 'Maharashtra', 'state', 'West India', 'Mumbai', ['Manufacturing', 'Automotive', 'Technology', 'Logistics'], 'EV manufacturing and integrated logistics infrastructure.', ['mh']),
  location('manipur', 'Manipur', 'state', 'North-East India', 'Imphal', ['Tourism', 'Textiles', 'Food Processing'], 'Creative industries and cross-regional commerce.', ['mn']),
  location('meghalaya', 'Meghalaya', 'state', 'North-East India', 'Shillong', ['Tourism', 'Agriculture', 'Food Processing'], 'Eco-tourism and premium horticulture value chains.', ['ml']),
  location('mizoram', 'Mizoram', 'state', 'North-East India', 'Aizawl', ['Agriculture', 'Food Processing', 'Tourism'], 'Bamboo, horticulture and community-led tourism.', ['mz']),
  location('nagaland', 'Nagaland', 'state', 'North-East India', 'Kohima', ['Agriculture', 'Tourism', 'Textiles'], 'Specialty agriculture and cultural tourism enterprises.', ['nl']),
  location('odisha', 'Odisha', 'state', 'East India', 'Bhubaneswar', ['Infrastructure', 'Manufacturing', 'Renewable Energy', 'Logistics'], 'Port-linked manufacturing and clean industrial growth.', ['or']),
  location('punjab', 'Punjab', 'state', 'North India', 'Chandigarh', ['Agriculture', 'Food Processing', 'Textiles'], 'Modern food processing and agricultural supply chains.', ['pb']),
  location('rajasthan', 'Rajasthan', 'state', 'North India', 'Jaipur', ['Renewable Energy', 'Tourism', 'Textiles', 'Infrastructure'], 'Solar infrastructure and heritage tourism circuits.', ['rj']),
  location('sikkim', 'Sikkim', 'state', 'North-East India', 'Gangtok', ['Tourism', 'Agriculture', 'Healthcare'], 'Wellness tourism and high-value organic produce.', ['sk']),
  location('tamil-nadu', 'Tamil Nadu', 'state', 'South India', 'Chennai', ['Automotive', 'Electronics', 'Textiles', 'Renewable Energy'], 'Advanced manufacturing and offshore wind supply chains.', ['tn']),
  location('telangana', 'Telangana', 'state', 'South India', 'Hyderabad', ['Technology', 'Pharmaceuticals', 'Healthcare', 'Electronics'], 'Digital infrastructure and life-sciences innovation.', ['tg']),
  location('tripura', 'Tripura', 'state', 'North-East India', 'Agartala', ['Food Processing', 'Agriculture', 'Logistics'], 'Food processing and regional trade logistics.', ['tr']),
  location('uttar-pradesh', 'Uttar Pradesh', 'state', 'North India', 'Lucknow', ['Infrastructure', 'Electronics', 'Food Processing', 'Tourism'], 'Electronics clusters and multimodal infrastructure.', ['up']),
  location('uttarakhand', 'Uttarakhand', 'state', 'North India', 'Dehradun', ['Tourism', 'Healthcare', 'Pharmaceuticals', 'Renewable Energy'], 'Wellness, life sciences and low-impact tourism.', ['ut']),
  location('west-bengal', 'West Bengal', 'state', 'East India', 'Kolkata', ['Logistics', 'Manufacturing', 'Textiles', 'Technology'], 'Eastern logistics gateways and modern manufacturing.', ['wb']),
  location('andaman-and-nicobar-islands', 'Andaman and Nicobar Islands', 'union-territory', 'Union Territories', 'Port Blair', ['Tourism', 'Logistics', 'Renewable Energy'], 'Sustainable island tourism and resilient infrastructure.', ['an']),
  location('chandigarh', 'Chandigarh', 'union-territory', 'Union Territories', 'Chandigarh', ['Technology', 'Healthcare', 'Services'], 'Urban innovation and knowledge-based services.', ['ch']),
  location('dadra-and-nagar-haveli-and-daman-and-diu', 'Dadra and Nagar Haveli and Daman and Diu', 'union-territory', 'Union Territories', 'Daman', ['Manufacturing', 'Tourism', 'Logistics'], 'Compact manufacturing clusters and coastal tourism.', ['dn', 'dd']),
  location('delhi', 'Delhi', 'union-territory', 'Union Territories', 'New Delhi', ['Technology', 'Healthcare', 'Logistics', 'Services'], 'Urban technology and healthcare innovation platforms.', ['dl']),
  location('jammu-and-kashmir', 'Jammu and Kashmir', 'union-territory', 'Union Territories', 'Srinagar / Jammu', ['Tourism', 'Agriculture', 'Food Processing', 'Textiles'], 'Horticulture value chains and responsible tourism.', ['jk']),
  location('ladakh', 'Ladakh', 'union-territory', 'Union Territories', 'Leh', ['Renewable Energy', 'Tourism', 'Infrastructure'], 'High-altitude clean energy and resilient tourism.', []),
  location('lakshadweep', 'Lakshadweep', 'union-territory', 'Union Territories', 'Kavaratti', ['Tourism', 'Renewable Energy', 'Food Processing'], 'Low-impact island tourism and distributed clean energy.', ['ld']),
  location('puducherry', 'Puducherry', 'union-territory', 'Union Territories', 'Puducherry', ['Tourism', 'Manufacturing', 'Technology'], 'Heritage tourism and compact innovation clusters.', ['py']),
].sort((a, b) => a.name.localeCompare(b.name))

const opportunity = (slug, name, stateSlug, sector, investmentSize, investmentRequirement, projectStage, opportunityType, description, extras = {}) => ({
  id: slug,
  slug,
  name,
  stateSlug,
  sector,
  investmentSize,
  investmentRequirement,
  projectStage,
  opportunityType,
  description,
  overview: 'An investment concept highlighting sector potential, partnership formats and possible delivery pathways.',
  highlights: ['Project concept and sector context', 'Potential investment structure', 'Regional growth opportunity'],
  requirements: ['Technical partnership', 'Investment participation'],
  featured: false,
  ...extras,
})

export const opportunities = [
  opportunity('green-hydrogen-gujarat', 'Green Hydrogen Development Opportunity', 'gujarat', 'Green Hydrogen', 'Large', 'Estimated investment — USD 500 million', 'Development', 'Equity / Joint Venture', 'A clean-energy hub integrating production and export infrastructure.', { featured: true }),
  opportunity('port-logistics-gujarat', 'Smart Port Logistics Corridor', 'gujarat', 'Logistics', 'Large', 'Estimated investment — USD 280 million', 'Concept', 'Public-Private Partnership', 'A digitally coordinated logistics and warehousing corridor.'),
  opportunity('ev-manufacturing-maharashtra', 'EV Manufacturing Cluster', 'maharashtra', 'EV & Mobility', 'Large', 'Estimated investment — USD 420 million', 'Development', 'Equity / Joint Venture', 'An integrated electric-vehicle and component manufacturing ecosystem.', { featured: true }),
  opportunity('logistics-maharashtra', 'Multimodal Logistics Hub', 'maharashtra', 'Logistics', 'Large', 'Estimated investment — USD 240 million', 'Feasibility', 'Public-Private Partnership', 'A multimodal freight, cold-chain and urban distribution hub.'),
  opportunity('semiconductor-karnataka', 'Semiconductor Design Campus', 'karnataka', 'Semiconductors', 'Large', 'Estimated investment — USD 350 million', 'Concept', 'Equity / Joint Venture', 'A shared semiconductor design, testing and skills campus.', { featured: true }),
  opportunity('digital-health-karnataka', 'Digital Health Innovation Network', 'karnataka', 'Healthcare', 'Medium', 'Estimated investment — USD 85 million', 'Pilot', 'Strategic Partnership', 'A network connecting clinical research and digital-health ventures.'),
  opportunity('electronics-tamil-nadu', 'Electronics Manufacturing Expansion', 'tamil-nadu', 'Electronics', 'Large', 'Estimated investment — USD 310 million', 'Development', 'Equity / Joint Venture', 'A high-value electronics and component manufacturing expansion.'),
  opportunity('offshore-wind-tamil-nadu', 'Offshore Wind Supply Chain', 'tamil-nadu', 'Renewable Energy', 'Large', 'Estimated investment — USD 460 million', 'Feasibility', 'Strategic Partnership', 'A supplier ecosystem for offshore wind components and services.'),
  opportunity('life-sciences-telangana', 'Life Sciences Scale-up Campus', 'telangana', 'Pharmaceuticals', 'Large', 'Estimated investment — USD 260 million', 'Development', 'Equity / Joint Venture', 'A campus for pharmaceutical manufacturing and research.'),
  opportunity('cloud-infrastructure-telangana', 'Sustainable Cloud Infrastructure', 'telangana', 'Technology', 'Large', 'Estimated investment — USD 390 million', 'Concept', 'Infrastructure Investment', 'A low-carbon digital infrastructure and data-services cluster.'),
  opportunity('electronics-uttar-pradesh', 'Electronics Components Park', 'uttar-pradesh', 'Electronics', 'Large', 'Estimated investment — USD 330 million', 'Development', 'Equity / Joint Venture', 'A supplier park supporting electronics manufacturing value chains.'),
  opportunity('food-processing-uttar-pradesh', 'Integrated Food Processing Network', 'uttar-pradesh', 'Food Processing', 'Medium', 'Estimated investment — USD 95 million', 'Feasibility', 'Strategic Partnership', 'A distributed processing and cold-chain network.'),
  opportunity('solar-rajasthan', 'Solar Manufacturing and Storage Hub', 'rajasthan', 'Renewable Energy', 'Large', 'Estimated investment — USD 510 million', 'Concept', 'Equity / Joint Venture', 'A solar-component and energy-storage manufacturing hub.', { featured: true }),
  opportunity('tourism-rajasthan', 'Heritage Tourism Circuit', 'rajasthan', 'Tourism', 'Medium', 'Estimated investment — USD 70 million', 'Pilot', 'Operating Partnership', 'A responsible-tourism circuit linking heritage destinations.'),
  opportunity('logistics-west-bengal', 'Eastern Trade Logistics Gateway', 'west-bengal', 'Logistics', 'Large', 'Estimated investment — USD 275 million', 'Feasibility', 'Public-Private Partnership', 'An integrated logistics gateway serving eastern trade routes.'),
  opportunity('textiles-west-bengal', 'Sustainable Textiles Cluster', 'west-bengal', 'Textiles', 'Medium', 'Estimated investment — USD 120 million', 'Development', 'Equity / Joint Venture', 'A circular-textiles production and skills cluster.'),
  opportunity('agri-logistics-assam', 'North-East Agri Logistics Network', 'assam', 'Logistics', 'Medium', 'Estimated investment — USD 90 million', 'Concept', 'Strategic Partnership', 'A cold-chain and market-access platform for regional produce.'),
  opportunity('renewables-madhya-pradesh', 'Renewable Energy Park', 'madhya-pradesh', 'Renewable Energy', 'Large', 'Estimated investment — USD 440 million', 'Feasibility', 'Infrastructure Investment', 'A hybrid renewable-energy and storage development.'),
  opportunity('port-manufacturing-odisha', 'Port-linked Manufacturing Zone', 'odisha', 'Manufacturing', 'Large', 'Estimated investment — USD 380 million', 'Development', 'Public-Private Partnership', 'A low-carbon industrial zone linked to port infrastructure.'),
  opportunity('health-tourism-kerala', 'Health and Wellness Tourism Network', 'kerala', 'Healthcare', 'Medium', 'Estimated investment — USD 65 million', 'Pilot', 'Operating Partnership', 'A health, wellness and hospitality collaboration network.'),
  opportunity('urban-tech-delhi', 'Urban Technology Testbed', 'delhi', 'Technology', 'Medium', 'Estimated investment — USD 110 million', 'Pilot', 'Strategic Partnership', 'A platform for mobility, civic and climate technologies.'),
  opportunity('horticulture-jammu-kashmir', 'Horticulture Value Chain', 'jammu-and-kashmir', 'Food Processing', 'Medium', 'Estimated investment — USD 75 million', 'Feasibility', 'Strategic Partnership', 'A storage, processing and market-access network for horticulture.'),
  opportunity('clean-energy-ladakh', 'High-altitude Clean Energy System', 'ladakh', 'Renewable Energy', 'Large', 'Estimated investment — USD 290 million', 'Concept', 'Infrastructure Investment', 'A renewable-energy and resilient microgrid programme.'),
  opportunity('island-tourism-andaman', 'Sustainable Island Tourism Initiative', 'andaman-and-nicobar-islands', 'Tourism', 'Medium', 'Estimated investment — USD 80 million', 'Concept', 'Operating Partnership', 'A low-impact island hospitality and services initiative.'),
].sort((a, b) => a.name.localeCompare(b.name))

export const getLocation = (slug) => locations.find((item) => item.slug === slug)
export const getOpportunity = (slug) => opportunities.find((item) => item.slug === slug)
export const getLocationOpportunities = (slug) => opportunities.filter((item) => item.stateSlug === slug)
export const getOpportunityCount = (slug) => getLocationOpportunities(slug).length
export const sectors = [...new Set(opportunities.map((item) => item.sector))].sort()
export const regions = [...new Set(locations.map((item) => item.region))]
export const mapLocationById = Object.fromEntries(locations.flatMap((item) => item.mapIds.map((mapId) => [mapId, item])))
