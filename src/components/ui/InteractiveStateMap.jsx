import { useState } from 'react'
import { Link } from 'react-router-dom'

const ALL_STATES = [
  { name: "Andhra Pradesh", region: "southern", hasPage: false },
  { name: "Arunachal Pradesh", region: "eastern", hasPage: false },
  { name: "Assam", region: "eastern", hasPage: false },
  { name: "Bihar", region: "eastern", hasPage: false },
  { name: "Chandigarh", region: "northern", hasPage: false },
  { name: "Chhattisgarh", region: "eastern", hasPage: false },
  { name: "Delhi", region: "northern", hasPage: false },
  { name: "Goa", region: "western", hasPage: false },
  { name: "Gujarat", region: "western", hasPage: false },
  { name: "Haryana", region: "northern", hasPage: false },
  { name: "Himachal Pradesh", region: "northern", hasPage: false },
  { name: "Jammu and Kashmir", region: "northern", hasPage: false },
  { name: "Jharkhand", region: "eastern", hasPage: false },
  { name: "Karnataka", region: "southern", hasPage: false },
  { name: "Kerala", region: "southern", hasPage: false },
  { name: "Madhya Pradesh", region: "western", hasPage: false },
  { name: "Maharashtra", region: "western", hasPage: false },
  { name: "Manipur", region: "eastern", hasPage: false },
  { name: "Meghalaya", region: "eastern", hasPage: false },
  { name: "Mizoram", region: "eastern", hasPage: false },
  { name: "Nagaland", region: "eastern", hasPage: false },
  { name: "Odisha", region: "eastern", hasPage: false },
  { name: "Puducherry", region: "southern", hasPage: false },
  { name: "Punjab", region: "northern", hasPage: false },
  { name: "Rajasthan", region: "northern", hasPage: false },
  { name: "Sikkim", region: "eastern", hasPage: false },
  { name: "Tamil Nadu", region: "southern", hasPage: false },
  { name: "Telangana", region: "southern", hasPage: false },
  { name: "Tripura", region: "eastern", hasPage: false },
  { name: "Uttar Pradesh", region: "northern", hasPage: false },
  { name: "Uttarakhand", region: "northern", hasPage: false },
  { name: "West Bengal", region: "eastern", hasPage: false },
]

const REGION_COLORS = {
  eastern: 'border-l-green',
  western: 'border-l-saffron',
  northern: 'border-l-royal',
  southern: 'border-l-cyan',
}

const REGION_STATE_COUNTS = {
  eastern: 8,
  western: 4,
  northern: 9,
  southern: 6,
}

export default function InteractiveStateMap() {
  const [hoveredState, setHoveredState] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [dropdownState, setDropdownState] = useState('')

  const filteredStates = selectedRegion === 'all' 
    ? ALL_STATES 
    : ALL_STATES.filter(state => state.region === selectedRegion)

  const regions = ['all', 'eastern', 'western', 'northern', 'southern']

  const handleStateClick = (state) => {
    setSelectedState(state)
  }

  const handleDropdownChange = (e) => {
    const selected = ALL_STATES.find(s => s.name === e.target.value)
    if (selected) {
      setSelectedState(selected)
      setDropdownState(e.target.value)
    }
  }

  const clearSelection = () => {
    setSelectedState(null)
    setDropdownState('')
  }

  return (
    <div className="space-y-6">
      {/* Region Filter */}
      <div className="flex flex-wrap gap-2">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
              selectedRegion === region
                ? 'bg-navy-deep text-white'
                : 'bg-white text-navy-deep border border-border hover:bg-off-white'
            }`}
          >
            {region === 'all' ? 'All Regions' : 
             region === 'eastern' ? 'Eastern & NE' :
             region === 'western' ? 'Western' :
             region === 'northern' ? 'Northern' :
             region === 'southern' ? 'Southern' : region}
          </button>
        ))}
      </div>

      {/* Map and Data Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {filteredStates.map((state) => (
              <div
                key={state.name}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  selectedState?.name === state.name 
                    ? 'ring-2 ring-royal ring-offset-2 z-10' 
                    : ''
                }`}
                onClick={() => handleStateClick(state)}
                onMouseEnter={() => setHoveredState(state.name)}
                onMouseLeave={() => setHoveredState(null)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${state.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleStateClick(state)
                  }
                }}
              >
                <div
                  className={`border border-border bg-white p-3 transition-all duration-200 hover:border-royal ${REGION_COLORS[state.region]} border-l-4`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium transition-colors duration-200 ${
                      selectedState?.name === state.name 
                        ? 'text-royal' 
                        : 'text-navy-deep group-hover:text-royal'
                    }`}>
                      {state.name}
                    </span>
                    {selectedState?.name === state.name && (
                      <span className="text-xs text-royal">✓</span>
                    )}
                  </div>
                </div>

                {/* Tooltip */}
                {hoveredState === state.name && (
                  <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-navy-deep text-white text-xs rounded shadow-lg whitespace-nowrap">
                    {state.name} — {state.region} Region ({REGION_STATE_COUNTS[state.region]} states)
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-deep" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Dropdown Fallback */}
            <div className="space-y-2">
              <label htmlFor="state-selector" className="block text-sm font-medium text-navy-deep">
                Select State
              </label>
              <select
                id="state-selector"
                value={dropdownState}
                onChange={handleDropdownChange}
                className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-royal focus:ring-1 focus:ring-royal"
              >
                <option value="">Choose a state...</option>
                {ALL_STATES.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name} ({state.region.charAt(0).toUpperCase() + state.region.slice(1)} Region)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected State Info */}
            {selectedState ? (
              <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy-deep">{selectedState.name}</h3>
                    <p className="text-sm text-muted-fg">{selectedState.region.charAt(0).toUpperCase() + selectedState.region.slice(1)} Region</p>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-muted-fg hover:text-royal"
                    aria-label="Clear selection"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="rounded border border-border bg-off-white p-3">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-navy-deep">Investment Focus</h4>
                    <p className="text-xs text-muted-fg">
                      {selectedState.region === 'eastern' && 'Mining, agriculture, hydro power, and infrastructure development'}
                      {selectedState.region === 'western' && 'Industrial manufacturing, gems & jewellery, textiles, and IT-ITES'}
                      {selectedState.region === 'northern' && 'Agro-processing, textiles, pharmaceuticals, and MSMEs'}
                      {selectedState.region === 'southern' && 'IT-ITES, pharmaceuticals, automotive, and biotechnology'}
                    </p>
                  </div>
                  
                  <div className="rounded border border-border bg-off-white p-3">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-navy-deep">Key Sectors</h4>
                    <p className="text-xs text-muted-fg">
                      {selectedState.region === 'eastern' && 'Mining & Minerals, Power, Agriculture, Infrastructure'}
                      {selectedState.region === 'western' && 'Manufacturing, IT/ITES, Gems & Jewellery, Textiles'}
                      {selectedState.region === 'northern' && 'Agro & Food Processing, Textiles, Pharma, MSMEs'}
                      {selectedState.region === 'southern' && 'IT/Software, Biotech, Pharma, Automotive'}
                    </p>
                  </div>

                  <Link
                    to="/states-investment"
                    className="block w-full text-center rounded bg-navy-deep px-4 py-2 text-sm font-medium text-white hover:bg-royal transition-colors duration-200"
                  >
                    View All States
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-off-white p-6 text-center">
                <p className="text-sm text-muted-fg">
                  Click on a state or use the dropdown above to view investment information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-fg">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-l-4 border-green bg-white" />
          <span>Eastern & North Eastern</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-l-4 border-saffron bg-white" />
          <span>Western</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-l-4 border-royal bg-white" />
          <span>Northern</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-l-4 border-cyan bg-white" />
          <span>Southern</span>
        </div>
      </div>
    </div>
  )
}
