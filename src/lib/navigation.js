import home from '../../content/home.json'

export const COUNCIL_MENU_ITEMS = [
  { label: 'All Councils / Sector & Regional Councils', href: '/councils' },
  { label: 'Parliamentarian Councils', href: '/councils/parliamentarian' },
  { label: 'International Business Councils', href: '/councils/international' },
]

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Councils', href: '/councils', children: COUNCIL_MENU_ITEMS },
  { label: 'Membership', href: '/membership' },
  { label: 'States Investment', href: '/states-investment' },
  {
    label: 'Initiatives', href: '/market-entry',
    children: home.centers.items.map((center) => ({
      label: center.name,
      href: center.name === 'Center for Market Entry & Business Expansion' ? '/market-entry' : '/#initiatives',
    })),
  },
  { label: 'Careers', href: '/careers' },
  { label: 'News & Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]
