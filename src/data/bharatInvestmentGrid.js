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
  summary: `Illustrative overview of investment themes in ${name} for the Bharat Investment Grid prototype.`,
})

// Single source of truth for BIG prototype content. Replace these illustrative records with
// reviewed, verified source data before any production investment solicitation is published.
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
  overview: 'Illustrative prototype content created to demonstrate investment discovery. This is not a confirmed government project or investment solicitation.',
  highlights: ['Prototype project information', 'Illustrative investment structure', 'Demonstration content only'],
  requirements: ['Illustrative technical partnership', 'Illustrative investment participation'],
  illustrative: true,
  featured: false,
  ...extras,
})

export const opportunities = [
  opportunity('illustrative-green-hydrogen-gujarat', 'Illustrative Green Hydrogen Development Opportunity', 'gujarat', 'Green Hydrogen', 'Large', 'Illustrative prototype value — USD 500 million', 'Development', 'Equity / Joint Venture', 'A fictional clean-energy hub demonstrating integrated production and export infrastructure.', { featured: true }),
  opportunity('illustrative-port-logistics-gujarat', 'Illustrative Smart Port Logistics Corridor', 'gujarat', 'Logistics', 'Large', 'Illustrative prototype value — USD 280 million', 'Concept', 'Public-Private Partnership', 'A sample digitally coordinated logistics and warehousing corridor.'),
  opportunity('illustrative-ev-manufacturing-maharashtra', 'Illustrative EV Manufacturing Cluster', 'maharashtra', 'EV & Mobility', 'Large', 'Illustrative prototype value — USD 420 million', 'Development', 'Equity / Joint Venture', 'A sample integrated electric-vehicle and component manufacturing ecosystem.', { featured: true }),
  opportunity('illustrative-logistics-maharashtra', 'Illustrative Multimodal Logistics Hub', 'maharashtra', 'Logistics', 'Large', 'Illustrative prototype value — USD 240 million', 'Feasibility', 'Public-Private Partnership', 'A fictional multimodal freight, cold-chain and urban distribution hub.'),
  opportunity('illustrative-semiconductor-karnataka', 'Illustrative Semiconductor Design Campus', 'karnataka', 'Semiconductors', 'Large', 'Illustrative prototype value — USD 350 million', 'Concept', 'Equity / Joint Venture', 'A sample shared semiconductor design, testing and skills campus.', { featured: true }),
  opportunity('illustrative-digital-health-karnataka', 'Illustrative Digital Health Innovation Network', 'karnataka', 'Healthcare', 'Medium', 'Illustrative prototype value — USD 85 million', 'Pilot', 'Strategic Partnership', 'A demonstration network connecting clinical research and digital-health ventures.'),
  opportunity('illustrative-electronics-tamil-nadu', 'Illustrative Electronics Manufacturing Expansion', 'tamil-nadu', 'Electronics', 'Large', 'Illustrative prototype value — USD 310 million', 'Development', 'Equity / Joint Venture', 'A fictional high-value electronics and component manufacturing expansion.'),
  opportunity('illustrative-offshore-wind-tamil-nadu', 'Illustrative Offshore Wind Supply Chain', 'tamil-nadu', 'Renewable Energy', 'Large', 'Illustrative prototype value — USD 460 million', 'Feasibility', 'Strategic Partnership', 'A sample supplier ecosystem for offshore wind components and services.'),
  opportunity('illustrative-life-sciences-telangana', 'Illustrative Life Sciences Scale-up Campus', 'telangana', 'Pharmaceuticals', 'Large', 'Illustrative prototype value — USD 260 million', 'Development', 'Equity / Joint Venture', 'A demonstration campus for pharmaceutical manufacturing and research.'),
  opportunity('illustrative-cloud-infrastructure-telangana', 'Illustrative Sustainable Cloud Infrastructure', 'telangana', 'Technology', 'Large', 'Illustrative prototype value — USD 390 million', 'Concept', 'Infrastructure Investment', 'A fictional low-carbon digital infrastructure and data-services cluster.'),
  opportunity('illustrative-electronics-uttar-pradesh', 'Illustrative Electronics Components Park', 'uttar-pradesh', 'Electronics', 'Large', 'Illustrative prototype value — USD 330 million', 'Development', 'Equity / Joint Venture', 'A sample supplier park supporting electronics manufacturing value chains.'),
  opportunity('illustrative-food-processing-uttar-pradesh', 'Illustrative Integrated Food Processing Network', 'uttar-pradesh', 'Food Processing', 'Medium', 'Illustrative prototype value — USD 95 million', 'Feasibility', 'Strategic Partnership', 'A fictional distributed processing and cold-chain network.'),
  opportunity('illustrative-solar-rajasthan', 'Illustrative Solar Manufacturing and Storage Hub', 'rajasthan', 'Renewable Energy', 'Large', 'Illustrative prototype value — USD 510 million', 'Concept', 'Equity / Joint Venture', 'A sample solar-component and energy-storage manufacturing hub.', { featured: true }),
  opportunity('illustrative-tourism-rajasthan', 'Illustrative Heritage Tourism Circuit', 'rajasthan', 'Tourism', 'Medium', 'Illustrative prototype value — USD 70 million', 'Pilot', 'Operating Partnership', 'A demonstration responsible-tourism circuit linking heritage destinations.'),
  opportunity('illustrative-logistics-west-bengal', 'Illustrative Eastern Trade Logistics Gateway', 'west-bengal', 'Logistics', 'Large', 'Illustrative prototype value — USD 275 million', 'Feasibility', 'Public-Private Partnership', 'A fictional integrated logistics gateway serving eastern trade routes.'),
  opportunity('illustrative-textiles-west-bengal', 'Illustrative Sustainable Textiles Cluster', 'west-bengal', 'Textiles', 'Medium', 'Illustrative prototype value — USD 120 million', 'Development', 'Equity / Joint Venture', 'A sample circular-textiles production and skills cluster.'),
  opportunity('illustrative-agri-logistics-assam', 'Illustrative North-East Agri Logistics Network', 'assam', 'Logistics', 'Medium', 'Illustrative prototype value — USD 90 million', 'Concept', 'Strategic Partnership', 'A demonstration cold-chain and market-access platform for regional produce.'),
  opportunity('illustrative-renewables-madhya-pradesh', 'Illustrative Renewable Energy Park', 'madhya-pradesh', 'Renewable Energy', 'Large', 'Illustrative prototype value — USD 440 million', 'Feasibility', 'Infrastructure Investment', 'A sample hybrid renewable-energy and storage development.'),
  opportunity('illustrative-port-manufacturing-odisha', 'Illustrative Port-linked Manufacturing Zone', 'odisha', 'Manufacturing', 'Large', 'Illustrative prototype value — USD 380 million', 'Development', 'Public-Private Partnership', 'A fictional low-carbon industrial zone linked to port infrastructure.'),
  opportunity('illustrative-health-tourism-kerala', 'Illustrative Health and Wellness Tourism Network', 'kerala', 'Healthcare', 'Medium', 'Illustrative prototype value — USD 65 million', 'Pilot', 'Operating Partnership', 'A sample health, wellness and hospitality collaboration network.'),
  opportunity('illustrative-urban-tech-delhi', 'Illustrative Urban Technology Testbed', 'delhi', 'Technology', 'Medium', 'Illustrative prototype value — USD 110 million', 'Pilot', 'Strategic Partnership', 'A demonstration platform for mobility, civic and climate technologies.'),
  opportunity('illustrative-horticulture-jammu-kashmir', 'Illustrative Horticulture Value Chain', 'jammu-and-kashmir', 'Food Processing', 'Medium', 'Illustrative prototype value — USD 75 million', 'Feasibility', 'Strategic Partnership', 'A fictional storage, processing and market-access network for horticulture.'),
  opportunity('illustrative-clean-energy-ladakh', 'Illustrative High-altitude Clean Energy System', 'ladakh', 'Renewable Energy', 'Large', 'Illustrative prototype value — USD 290 million', 'Concept', 'Infrastructure Investment', 'A sample renewable-energy and resilient microgrid programme.'),
  opportunity('illustrative-island-tourism-andaman', 'Illustrative Sustainable Island Tourism Initiative', 'andaman-and-nicobar-islands', 'Tourism', 'Medium', 'Illustrative prototype value — USD 80 million', 'Concept', 'Operating Partnership', 'A demonstration low-impact island hospitality and services initiative.'),
].sort((a, b) => a.name.localeCompare(b.name))

export const getLocation = (slug) => locations.find((item) => item.slug === slug)
export const getOpportunity = (slug) => opportunities.find((item) => item.slug === slug)
export const getLocationOpportunities = (slug) => opportunities.filter((item) => item.stateSlug === slug)
export const getOpportunityCount = (slug) => getLocationOpportunities(slug).length
export const sectors = [...new Set(opportunities.map((item) => item.sector))].sort()
export const regions = [...new Set(locations.map((item) => item.region))]
export const mapLocationById = Object.fromEntries(locations.flatMap((item) => item.mapIds.map((mapId) => [mapId, item])))

export const PROTOTYPE_DISCLOSURE = 'This is a frontend prototype. Opportunities and figures shown are illustrative and do not represent confirmed government projects or investment solicitations.'
