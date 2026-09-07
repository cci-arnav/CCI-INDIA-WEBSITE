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

export default function InteractiveStateMap() {
  const [hoveredState, setHoveredState] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('all')

  const filteredStates = selectedRegion === 'all' 
    ? ALL_STATES 
    : ALL_STATES.filter(state => state.region === selectedRegion)

  const regions = ['all', 'eastern', 'western', 'northern', 'southern']

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

      {/* State Grid */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredStates.map((state) => (
          <div
            key={state.name}
            className="relative group"
            onMouseEnter={() => setHoveredState(state.name)}
            onMouseLeave={() => setHoveredState(null)}
          >
            {state.hasPage ? (
              <Link
                to={`/states/${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block border border-border bg-white p-3 transition-all duration-200 hover:border-royal hover:shadow-md ${REGION_COLORS[state.region]} border-l-4`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-deep group-hover:text-royal transition-colors duration-200">
                    {state.name}
                  </span>
                  <span className="text-xs text-green">→</span>
                </div>
              </Link>
            ) : (
              <div
                className={`border border-border bg-white p-3 transition-all duration-200 ${REGION_COLORS[state.region]} border-l-4 opacity-60 cursor-not-allowed`}
                title="Coming Soon"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-fg">
                    {state.name}
                  </span>
                  <span className="text-xs text-muted-fg">Coming Soon</span>
                </div>
              </div>
            )}

            {/* Tooltip */}
            {hoveredState === state.name && (
              <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-navy-deep text-white text-xs rounded shadow-lg whitespace-nowrap">
                {state.name} — {state.region} Region
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-deep" />
              </div>
            )}
          </div>
        ))}
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
