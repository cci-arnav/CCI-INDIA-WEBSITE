"""Download, validate and optimize reusable council imagery from Wikimedia Commons.

The script updates content/councils.json and writes source/license metadata to
content/council-image-attributions.json. It intentionally rejects icons, maps,
portraits, logos and other poor card imagery by filename and dimensions.
"""

from __future__ import annotations

import concurrent.futures
import html
import io
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "content" / "councils.json"
ATTRIBUTION_PATH = ROOT / "content" / "council-image-attributions.json"
OUTPUT_DIR = ROOT / "public" / "assets" / "councils"
API = "https://commons.wikimedia.org/w/api.php"
WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "CCIIndiaWebsiteImageImporter/1.0 (website asset migration)"
ALLOWED_LICENSES = ("cc by", "cc-by", "cc0", "public domain", "pd-", "fal")
REJECT_WORDS = {
    "logo", "icon", "seal", "coat of arms", "emblem", "diagram", "map", "poster",
    "stamp", "coin", "banknote", "portrait", "headshot", "signature", "drawing",
    "painting", "cartoon", "screenshot", "infographic", "chart", "banner", "svg",
}

QUERIES = {
    "agriculture": "Indian agriculture crop field farmer",
    "ayurveda-and-herbal-ayush": "Ayurvedic medicinal herbs India",
    "aromatic-and-medicinal-council": "medicinal aromatic plants India",
    "banking-and-finance": "Mumbai skyline financial district",
    "bio-and-nano-technology": "biotechnology laboratory",
    "brand-fashion-and-design": "Indian textile fashion",
    "brand-promotion": "professional creative advertising studio",
    "business-aircraft-operators": "business jet aircraft airport",
    "capital-markets": "Bombay Stock Exchange building Mumbai",
    "civil-aviation": "commercial aircraft Indian airport",
    "coal": "open cast coal mine India",
    "company-law-and-corporate-affairs": "corporate board meeting India business",
    "corporate-governance-and-csr": "corporate social responsibility volunteers India",
    "computers-and-electronic-committee": "electronics circuit board manufacturing",
    "corporate-fraud-and-internal-audit": "financial audit documents office",
    "cultural": "Indian classical dance cultural performance",
    "cyber-law-and-it-act": "cybersecurity data centre server racks",
    "defence": "India defence manufacturing aircraft factory",
    "direct-taxes": "Indian business accounting documents calculator",
    "diaspora": "Indian diaspora community cultural gathering",
    "drugs-and-pharmaceuticals": "pharmaceutical laboratory medicine production",
    "e-commerce": "ecommerce warehouse packages conveyor",
    "e-governance": "digital India public service computer centre",
    "eastern-region-development-council": "Kolkata skyline business district",
    "economic-affairs": "Indian economy business district Mumbai",
    "education": "Indian university students classroom",
    "entertainment": "Indian film production studio camera",
    "entrepreneurship-development": "Indian startup entrepreneurs meeting",
    "environment-and-climate-change": "India forest renewable sustainability",
    "export-and-import": "container port India international trade",
    "food-processing-and-value-addition": "food processing factory India produce",
    "foreign-trade": "container cargo ship international trade",
    "gems-and-jewellery": "Indian jewellery craftsmanship artisan",
    "government-procurement": "government office tender documents India",
    "healthcare": "Indian hospital doctors medical technology",
    "highway": "modern expressway India highway infrastructure",
    "hrd": "professional training workshop India employees",
    "hydro-power": "hydroelectric dam India",
    "indirect-taxes-including-gst": "Indian GST accounting business documents",
    "infrastructure": "metro infrastructure construction India",
    "insurance": "business insurance meeting documents",
    "international-tax": "international business tax documents globe",
    "investment-and-investors-protection": "investor business meeting India",
    "iron-and-steel": "steel mill India molten steel",
    "it-and-ites": "India information technology office data centre",
    "knowledge-millennium-council": "digital knowledge library India technology",
    "leadership-development-council": "leadership training business seminar India",
    "legal-affairs-and-ipr": "Indian court legal documents law library",
    "luxury-and-lifestyle": "Indian luxury hotel interior craftsmanship",
    "manufacturing": "modern manufacturing factory India assembly line",
    "media": "television broadcasting studio India",
    "membership-development": "business networking conference India",
    "mergers-and-acquisition": "corporate merger business handshake meeting",
    "micro-finance-and-nbfc": "microfinance women self help group India",
    "mines-and-minerals": "responsible mining India quarry machinery",
    "new-and-renewable-energy": "solar panels wind turbines India",
    "non-government-organization": "NGO community development India volunteers",
    "northern-region-development-council": "New Delhi skyline business district",
    "north-eastern-region-development-council": "Guwahati Assam city development",
    "nuclear-energy": "nuclear power station India",
    "packaging": "packaging factory production line",
    "petroleum-and-petrochemicals": "oil refinery India petrochemical plant",
    "port": "container port India cranes cargo",
    "private-security": "professional security guard commercial building India",
    "public-sector-enterprises": "India public sector industrial plant",
    "publishing": "printing press book production India",
    "railways": "Indian railway modern train infrastructure",
    "real-estate": "modern commercial buildings India real estate",
    "retail": "organized retail store India shopping",
    "rural-development": "Indian village rural development infrastructure",
    "seaplane": "seaplane on water aircraft",
    "shipping-and-logistics": "container ship logistics port India",
    "skill-development-centre": "vocational skills training India workshop",
    "southern-region-development-council": "Bengaluru skyline technology district",
    "smart-cities": "smart city urban infrastructure India metro",
    "msme": "small manufacturing enterprise India workshop",
    "special-task-force-on-sez": "India special economic zone industrial park",
    "spiritual": "Indian meditation spiritual centre",
    "telecom": "telecommunication tower India",
    "textile": "Indian textile mill weaving fabric",
    "thermal-power": "thermal power station India",
    "tourism-and-hospitality": "India hotel hospitality tourism",
    "urban-development": "Indian city urban development metro skyline",
    "venture-capital-and-private-equity": "startup investment meeting India entrepreneurs",
    "wellness": "wellness healthy living India spa",
    "western-region-development-council": "Mumbai skyline business district",
    "women-entrepreneurship": "Indian woman entrepreneur small business",
    "women-foundation": "Indian women community development group",
    "wto": "World Trade Organization building Geneva",
    "yoga": "yoga practice India outdoor",
    "india-japan-parliamentarian-council": "National Diet Building Tokyo exterior",
    "india-us-parliamentarian-council": "United States Capitol building exterior",
    "india-eu-parliamentarian-council": "European Parliament building Brussels exterior",
    "india-canada-parliamentarian-council": "Parliament Hill Ottawa exterior",
    "india-russia-parliamentarian-council": "State Duma building Moscow exterior",
    "india-vietnam-parliamentarian-council": "National Assembly Building Hanoi exterior",
    "india-saarc-parliamentarian-council": "SAARC Secretariat Kathmandu building",
    "india-brics-parliamentarian-council": "BRICS summit conference delegation",
    "india-asean-parliamentarian-council": "ASEAN Secretariat Jakarta building",
    "india-latin-america-parliamentarian-council": "Latin American parliament building exterior",
    "india-caribbean-parliamentarian-council": "CARICOM Secretariat Georgetown Guyana",
    "india-africa-and-business-council": "Mombasa container port Kenya trade",
    "brics-business-council": "BRICS business forum conference",
    "india-eu-business-council": "Rotterdam container port Europe trade",
    "india-usa-business-council": "Port of Los Angeles containers trade",
    "india-russia-and-cis-business-council": "Vladivostok commercial port Russia",
    "india-france-business-council": "La Defense Paris business district",
    "india-germany-business-council": "Frankfurt skyline financial district",
    "india-uk-business-council": "Canary Wharf London business district",
    "india-saarc-business-council": "Colombo container port Sri Lanka",
    "india-latin-american-countries-and-caribbean-business-council": "Panama Canal container ship trade",
}

# Exact encyclopedia topics are used instead of broad image keywords. This keeps
# ambiguous phrases such as "Indian agriculture" from returning unrelated uses
# of the word "Indian" while still giving every council a documentary image.
TOPICS = {
    "agriculture": "Agriculture in India", "ayurveda-and-herbal-ayush": "Ayurveda",
    "aromatic-and-medicinal-council": "Medicinal plants", "banking-and-finance": "Bandra Kurla Complex",
    "bio-and-nano-technology": "Biotechnology", "brand-fashion-and-design": "Textile industry in India",
    "brand-promotion": "Advertising", "business-aircraft-operators": "Business jet",
    "capital-markets": "BSE Limited", "civil-aviation": "Aviation in India", "coal": "Coal mining in India",
    "company-law-and-corporate-affairs": "Board of directors", "corporate-governance-and-csr": "Corporate social responsibility",
    "computers-and-electronic-committee": "Electronics industry in India", "corporate-fraud-and-internal-audit": "Financial audit",
    "cultural": "Culture of India", "cyber-law-and-it-act": "Computer security", "defence": "Defence industry of India",
    "direct-taxes": "Income tax in India", "diaspora": "Indian diaspora", "drugs-and-pharmaceuticals": "Pharmaceutical industry in India",
    "e-commerce": "E-commerce", "e-governance": "Digital India", "eastern-region-development-council": "Kolkata",
    "economic-affairs": "Economy of India", "education": "Education in India", "entertainment": "Cinema of India",
    "entrepreneurship-development": "Startup company", "environment-and-climate-change": "Climate change in India",
    "export-and-import": "International trade", "food-processing-and-value-addition": "Food processing",
    "foreign-trade": "Foreign trade of India", "gems-and-jewellery": "Jewellery in India",
    "government-procurement": "Government procurement", "healthcare": "Healthcare in India",
    "highway": "Expressways of India", "hrd": "Vocational education", "hydro-power": "Hydroelectric power in India",
    "indirect-taxes-including-gst": "Goods and Services Tax (India)", "infrastructure": "Infrastructure in India",
    "insurance": "Insurance in India", "international-tax": "International taxation",
    "investment-and-investors-protection": "Investment", "iron-and-steel": "Iron and steel industry in India",
    "it-and-ites": "Information technology in India", "knowledge-millennium-council": "Digital library",
    "leadership-development-council": "Leadership development", "legal-affairs-and-ipr": "Supreme Court of India",
    "luxury-and-lifestyle": "Luxury hotel", "manufacturing": "Manufacturing in India", "media": "Media of India",
    "membership-development": "Business networking", "mergers-and-acquisition": "Mergers and acquisitions",
    "micro-finance-and-nbfc": "Microfinance", "mines-and-minerals": "Mining in India",
    "new-and-renewable-energy": "Renewable energy in India", "non-government-organization": "Non-governmental organization",
    "northern-region-development-council": "New Delhi", "north-eastern-region-development-council": "Northeast India",
    "nuclear-energy": "Nuclear power in India", "packaging": "Packaging and labeling",
    "petroleum-and-petrochemicals": "Petroleum industry in India", "port": "Ports in India",
    "private-security": "Security guard", "public-sector-enterprises": "Public sector undertakings in India",
    "publishing": "Printing in India", "railways": "Rail transport in India", "real-estate": "Real estate in India",
    "retail": "Retailing in India", "rural-development": "Rural development", "seaplane": "Seaplane",
    "shipping-and-logistics": "Transport in India", "skill-development-centre": "Industrial training institute",
    "southern-region-development-council": "Bengaluru", "smart-cities": "Smart Cities Mission",
    "msme": "Small and medium enterprises", "special-task-force-on-sez": "Special economic zones in India",
    "spiritual": "Spirituality", "telecom": "Telecommunications in India", "textile": "Textile industry in India",
    "thermal-power": "Thermal power station", "tourism-and-hospitality": "Tourism in India",
    "urban-development": "Urbanisation in India", "venture-capital-and-private-equity": "Venture capital",
    "wellness": "Wellness", "western-region-development-council": "Mumbai",
    "women-entrepreneurship": "Women in business", "women-foundation": "Women in India",
    "wto": "World Trade Organization", "yoga": "Yoga",
    "india-japan-parliamentarian-council": "National Diet Building", "india-us-parliamentarian-council": "United States Capitol",
    "india-eu-parliamentarian-council": "Espace Léopold", "india-canada-parliamentarian-council": "Parliament Hill",
    "india-russia-parliamentarian-council": "State Duma", "india-vietnam-parliamentarian-council": "National Assembly Building of Vietnam",
    "india-saarc-parliamentarian-council": "SAARC", "india-brics-parliamentarian-council": "BRICS",
    "india-asean-parliamentarian-council": "ASEAN", "india-latin-america-parliamentarian-council": "Latin American Parliament",
    "india-caribbean-parliamentarian-council": "Caribbean Community", "india-africa-and-business-council": "Port of Mombasa",
    "brics-business-council": "BRICS", "india-eu-business-council": "Port of Rotterdam",
    "india-usa-business-council": "Port of Los Angeles", "india-russia-and-cis-business-council": "Port of Vladivostok",
    "india-france-business-council": "La Défense", "india-germany-business-council": "Frankfurt",
    "india-uk-business-council": "Canary Wharf", "india-saarc-business-council": "Port of Colombo",
    "india-latin-american-countries-and-caribbean-business-council": "Panama Canal",
}


def clean_text(value: str) -> str:
    value = html.unescape(re.sub(r"<[^>]+>", " ", value or ""))
    return re.sub(r"\s+", " ", value).strip()


def api_json(params: dict, api: str = API) -> dict:
    url = api + "?" + urllib.parse.urlencode(params)
    for attempt in range(7):
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                time.sleep(0.05)
                return json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == 6:
                raise
            retry_after = int(exc.headers.get("Retry-After", "0") or 0)
            time.sleep(max(retry_after, 5 * (attempt + 1)))
    raise RuntimeError("Commons API retry loop exhausted")


def candidate_for(council: dict) -> dict:
    topic = TOPICS[council["slug"]]
    payload = api_json({
        "action": "query", "format": "json", "redirects": 1, "titles": topic,
        "prop": "pageimages", "piprop": "name", "pilicense": "free", "pithumbsize": 1600,
    }, WIKIPEDIA_API)
    pages = list(payload.get("query", {}).get("pages", {}).values())
    filename = next((page.get("pageimage") for page in pages if page.get("pageimage")), None)
    if not filename:
        search = api_json({
            "action": "query", "format": "json", "generator": "search", "gsrsearch": topic,
            "gsrlimit": 6, "prop": "pageimages", "piprop": "name", "pilicense": "free", "pithumbsize": 1600,
        }, WIKIPEDIA_API)
        search_pages = sorted(search.get("query", {}).get("pages", {}).values(), key=lambda page: page.get("index", 999))
        filename = next((page.get("pageimage") for page in search_pages if page.get("pageimage")), None)
    if not filename:
        raise RuntimeError(f"No freely licensed Wikipedia lead image for {topic}")
    commons = api_json({
        "action": "query", "format": "json", "titles": f"File:{filename}",
        "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1280,
    })
    page = next(iter(commons.get("query", {}).get("pages", {}).values()), {})
    info = (page.get("imageinfo") or [{}])[0]
    metadata = info.get("extmetadata") or {}
    license_name = clean_text((metadata.get("LicenseShortName") or {}).get("value", ""))
    if not info.get("url") or not any(allowed in license_name.lower() for allowed in ALLOWED_LICENSES):
        raise RuntimeError(f"Commons license unavailable for {filename}")
    if info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}:
        raise RuntimeError(f"Unsupported lead image format for {filename}")
    return {
        "strategy": "wikipedia-lead-v1",
        "topic": topic,
        "query": topic,
        "title": page["title"].removeprefix("File:"),
        "downloadUrl": info.get("thumburl") or info["url"],
        "sourcePage": info.get("descriptionurl"),
        "creator": clean_text((metadata.get("Artist") or {}).get("value", "")) or "Wikimedia Commons contributor",
        "license": clean_text((metadata.get("LicenseShortName") or {}).get("value", "")),
        "licenseUrl": clean_text((metadata.get("LicenseUrl") or {}).get("value", "")),
        "originalWidth": info.get("width"),
        "originalHeight": info.get("height"),
    }


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def optimize(raw: bytes, target: Path) -> tuple[int, int, int]:
    with Image.open(io.BytesIO(raw)) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        max_width = min(1280, source.width)
        max_height = max(450, round(max_width * 9 / 16))
        fitted = ImageOps.fit(source, (max_width, max_height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        quality = 82
        while True:
            buffer = io.BytesIO()
            fitted.save(buffer, format="WEBP", quality=quality, method=6)
            if buffer.tell() <= 260_000 or quality <= 66:
                target.write_bytes(buffer.getvalue())
                return fitted.width, fitted.height, buffer.tell()
            quality -= 4


def process(council: dict) -> tuple[str, dict]:
    selected = candidate_for(council)
    download_url = selected.pop("downloadUrl")
    target = OUTPUT_DIR / f'{council["slug"]}.webp'
    width, height, byte_size = optimize(download(download_url), target)
    alt_subject = re.sub(r"\.[^.]+$", "", selected["title"]).replace("_", " ")
    council["image"] = f'/assets/councils/{council["slug"]}.webp'
    council["imageAlt"] = f'{alt_subject}, representing the {council["name"]} council'
    selected.update({
        "councilSlug": council["slug"], "localPath": council["image"],
        "width": width, "height": height, "bytes": byte_size,
    })
    return council["slug"], selected


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    councils = [
        *data["sectorCouncils"]["items"],
        *data["parliamentarianCouncils"]["items"],
        *data["internationalBusinessCouncils"]["items"],
    ]
    missing_queries = [item["slug"] for item in councils if item["slug"] not in QUERIES]
    if missing_queries:
        raise RuntimeError(f"Missing curated image queries: {missing_queries}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    attributions: dict[str, dict] = json.loads(ATTRIBUTION_PATH.read_text(encoding="utf-8")) if ATTRIBUTION_PATH.exists() else {}
    failures: list[str] = []
    pending = [council for council in councils if attributions.get(council["slug"], {}).get("strategy") != "wikipedia-lead-v1"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        future_map = {pool.submit(process, council): council for council in pending}
        for index, future in enumerate(concurrent.futures.as_completed(future_map), 1):
            council = future_map[future]
            try:
                slug, attribution = future.result()
                attributions[slug] = attribution
                DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
                ATTRIBUTION_PATH.write_text(json.dumps(dict(sorted(attributions.items())), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
                print(f"[{index:03}/{len(pending)}] {slug} ({attribution['bytes'] // 1024} KB)")
            except Exception as exc:  # Continue to produce a useful retry list.
                failures.append(council["slug"])
                print(f"FAILED {council['slug']}: {exc}")
    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ATTRIBUTION_PATH.write_text(json.dumps(dict(sorted(attributions.items())), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Completed {len(attributions)} images; failures={failures}")
    if failures:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
