import papers from "../../content/knowledge-papers.json" with { type: "json" };

const stateSlugs = [
  "andaman-and-nicobar-islands",
  "andhra-pradesh",
  "arunachal-pradesh",
  "assam",
  "bihar",
  "chandigarh",
  "chhattisgarh",
  "dadra-and-nagar-haveli-and-daman-and-diu",
  "delhi",
  "goa",
  "gujarat",
  "haryana",
  "himachal-pradesh",
  "jammu-and-kashmir",
  "jharkhand",
  "karnataka",
  "kerala",
  "ladakh",
  "lakshadweep",
  "madhya-pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "puducherry",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil-nadu",
  "telangana",
  "tripura",
  "uttar-pradesh",
  "uttarakhand",
  "west-bengal",
];

const stateImages = Object.fromEntries(
  stateSlugs.map((slug) => [
    slug,
    `/images/bharat-investment-grid/states/${slug}.jpg`,
  ]),
);
const statePaperImages = Object.fromEntries(
  stateSlugs.map((slug) => [
    `state-${slug}-knowledge-paper-2026`,
    stateImages[slug],
  ]),
);

const ministryImages = {
  "agriculture-and-farmers-welfare": "/assets/councils/agriculture.jpg",
  ayush: "/assets/councils/ayurveda-and-herbal-ayush.jpg",
  "chemicals-and-fertilizers": "/assets/councils/petroleum-and-petrochemicals.jpg",
  "civil-aviation": "/assets/councils/civil-aviation.jpg",
  coal: "/assets/councils/coal.jpg",
  "commerce-and-industry": "/assets/councils/foreign-trade.jpg",
  communications: "/assets/councils/telecom.jpg",
  "consumer-affairs-food-and-public-distribution":
    "/assets/councils/food-processing-and-value-addition.jpg",
  cooperation: "/assets/councils/rural-development.jpg",
  "corporate-affairs": "/assets/councils/company-law-and-corporate-affairs.jpg",
  culture: "/assets/councils/cultural.jpg",
  defence: "/assets/councils/defence.jpg",
  "development-of-north-eastern-region":
    "/assets/councils/north-eastern-region-development-council.jpg",
  education: "/assets/councils/education.jpg",
  "electronics-and-information-technology":
    "/assets/councils/computers-and-electronic-committee.jpg",
  "environment-forest-and-climate-change":
    "/assets/councils/environment-and-climate-change.jpg",
  "external-affairs": "/images/hero/india-russia-leaders.jpg",
  finance: "/assets/councils/banking-and-finance.jpg",
  "food-processing-industries":
    "/assets/councils/food-processing-and-value-addition.jpg",
  "health-and-family-welfare": "/assets/councils/healthcare.jpg",
  "heavy-industries": "/assets/councils/manufacturing.jpg",
  "home-affairs": "/assets/councils/private-security.jpg",
  "housing-and-urban-affairs": "/assets/councils/urban-development.jpg",
  "information-and-broadcasting": "/assets/councils/media.jpg",
  "jal-shakti": "/assets/councils/hydro-power.jpg",
  "labour-and-employment": "/assets/councils/skill-development-centre.jpg",
  "law-and-justice": "/assets/councils/legal-affairs-and-ipr.jpg",
  "micro-small-and-medium-enterprises":
    "/assets/councils/entrepreneurship-development.jpg",
  mines: "/assets/councils/mines-and-minerals.jpg",
  "new-and-renewable-energy": "/assets/councils/new-and-renewable-energy.jpg",
  "personnel-public-grievances-and-pensions": "/assets/councils/hrd.jpg",
  "petroleum-and-natural-gas": "/assets/councils/petroleum-and-petrochemicals.jpg",
  "ports-shipping-and-waterways": "/assets/councils/shipping-and-logistics.jpg",
  power: "/assets/councils/thermal-power.jpg",
  railways: "/assets/councils/railways.jpg",
  "road-transport-and-highways": "/assets/councils/highway.jpg",
  "rural-development": "/assets/councils/rural-development.jpg",
  "science-and-technology": "/assets/councils/bio-and-nano-technology.jpg",
  "skill-development-and-entrepreneurship":
    "/assets/councils/skill-development-centre.jpg",
  "social-justice-and-empowerment":
    "/assets/councils/non-government-organization.jpg",
  steel: "/assets/councils/iron-and-steel.jpg",
  textiles: "/assets/councils/textile.jpg",
  tourism: "/assets/councils/tourism-and-hospitality.jpg",
};

const ministryPaperImages = Object.fromEntries(
  Object.entries(ministryImages).map(([slug, image]) => [
    `ministry-${slug}-knowledge-paper-2026`,
    image,
  ]),
);

const bilateralCovers = {
  "india-chad-opportunities-2026": "/images/knowledge-papers/india-chad.jpg",
  "india-tunisia-shared-future-2026":
    "/images/knowledge-papers/india-tunisia.jpg",
  "india-georgia-opportunity-2026":
    "/images/knowledge-papers/india-georgia.jpg",
  "india-malawi-sustainable-prosperity-2026":
    "/images/knowledge-papers/india-malawi.jpg",
  "india-armenia-partnership-2026":
    "/images/knowledge-papers/india-armenia.jpg",
  "india-tea-industry-growth-2026":
    "/images/knowledge-papers/india-tea-industry.jpg",
  "india-dominican-republic-prosperity-2026":
    "/images/knowledge-papers/india-dominican-republic.jpg",
  "india-ecuador-partnership-2026":
    "/images/knowledge-papers/india-ecuador.jpg",
  "india-belarus-partnership-2026":
    "/images/knowledge-papers/india-belarus.jpg",
  "india-iraq-shared-prosperity-2026":
    "/images/knowledge-papers/india-iraq.jpg",
  "india-kenya-strengthening-ties-2026":
    "/images/knowledge-papers/india-kenya.jpg",
  "india-namibia-collaboration-2026":
    "/images/knowledge-papers/india-namibia.jpg",
  "india-nicaragua-shared-future-2026":
    "/images/knowledge-papers/india-nicaragua.jpg",
  "india-russia-bilateral-growth-2026":
    "/images/knowledge-papers/india-russia.jpg",
  "india-senegal-growth-opportunities-2026":
    "/images/knowledge-papers/india-senegal.jpg",
  "india-singapore-shaping-tomorrow-2026":
    "/images/knowledge-papers/india-singapore.jpg",
  "india-suriname-shared-future-2026":
    "/images/knowledge-papers/india-suriname.jpg",
};

const bilateralFlagPaperIds = new Set([
  "india-chad-opportunities-2026",
  "india-namibia-collaboration-2026",
  "india-malawi-sustainable-prosperity-2026",
  "india-georgia-opportunity-2026",
  "india-suriname-shared-future-2026",
  "india-singapore-shaping-tomorrow-2026",
  "india-senegal-growth-opportunities-2026",
  "india-russia-bilateral-growth-2026",
  "india-nicaragua-shared-future-2026",
  "india-kenya-strengthening-ties-2026",
  "india-iraq-shared-prosperity-2026",
  "india-belarus-partnership-2026",
  "india-ecuador-partnership-2026",
  "india-armenia-partnership-2026",
  "india-dominican-republic-prosperity-2026",
  "india-tunisia-shared-future-2026",
]);

const flags = (countryCode, countryName) =>
  countryCode && countryCode !== "IN"
    ? [
        { src: "https://flagcdn.com/w160/in.png", alt: "Flag of India" },
        {
          src: `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`,
          alt: `Flag of ${countryName}`,
        },
      ]
    : [];

const paperImages = Object.fromEntries(
  papers.map((paper) => {
    if (paper.collection === "State & UT") {
      return [
        paper.id,
        {
          image: statePaperImages[paper.id] || null,
          alt: `${paper.title.replace(/: State Knowledge Paper$/, "")} landmark`,
        },
      ];
    }

    if (paper.collection === "Ministry") {
      const image = ministryPaperImages[paper.id] || null;
      return [
        paper.id,
        {
          image,
          alt: image
            ? `${paper.title.replace(/: Knowledge Paper$/, "")} subject image`
            : "",
          fallback: "ministry",
        },
      ];
    }

    const image = bilateralFlagPaperIds.has(paper.id)
      ? null
      : bilateralCovers[paper.id] || null;
    const alt =
      paper.countryCode === "IN"
        ? "India tea cultivation and industry knowledge paper cover"
        : image
          ? `${paper.country} and India partnership cover`
          : "";
    return [
      paper.id,
      {
        image,
        alt,
        flags: flags(paper.countryCode, paper.country),
        fallback: "knowledgePaper",
      },
    ];
  }),
);

export const imageRegistry = {
  statesAndUTs: stateImages,
  ministries: ministryPaperImages,
  knowledgePapers: paperImages,
  fallbacks: {
    ministry: "/brand/cci-logo.png",
    knowledgePaper: "/brand/cci-logo.png",
  },
};

export const getStateImage = (slug) => imageRegistry.statesAndUTs[slug] || null;
export const getKnowledgePaperImage = (paperId) =>
  imageRegistry.knowledgePapers[paperId] || null;
