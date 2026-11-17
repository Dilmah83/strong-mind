// Licensed photographs. See docs/AUDIO-SOURCES.md for attribution.
export const landscapes = [
  {
    "id": "forest",
    "title": "Forest Rain",
    "alt": "Hoh_moss_lichen_canopy_tree_rainforest_cbubar_2015",
    "url": "/nature/forest.webp",
    "recommended": "forest-rain",
    "author": "Olympic National Park",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Hoh_moss_lichen_canopy_tree_rainforest_cbubar_2015_(22656711307).jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/1/13/Hoh_moss_lichen_canopy_tree_rainforest_cbubar_2015_%2822656711307%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "lake",
    "title": "Alpine lake",
    "alt": "Valley of the Ten Peaks and Moraine Lake, Banff National Park, Canada. Mountains from left to right: Tonsa (3057 m), Mount Perren (3051 m), Mount Allen (3310 m), Mount Tuzo (3246 m), Deltaform Mountain (3424 m), Neptuak Mountain (3233 m)",
    "url": "/nature/lake.webp",
    "recommended": "mountain-stream",
    "author": "Gorgo",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
    "source": "https://commons.wikimedia.org/wiki/File:Moraine_Lake_17092005.jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "coast",
    "title": "Atlantic coast",
    "alt": "Cliffs of Moher",
    "url": "/nature/coast.webp",
    "recommended": "ocean-swells",
    "author": "MPhernambucq",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Cliffs_of_Moher_(49037).jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Cliffs_of_Moher_%2849037%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "waterfall",
    "title": "Cascading waterfall",
    "alt": "Lateral view of the Seljalandsfoss waterfall during a sunset, Su\u00f0urland, Iceland. The waterfall of the river Seljalands\u00e1 drops 60 metres (200 ft) over the cliffs of the former coastline.",
    "url": "/nature/waterfall.webp",
    "recommended": "waterfall",
    "author": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Seljalandsfoss,_Su%C3%B0urland,_Islandia,_2014-08-16,_DD_189-191_HDR.JPG",
    "original": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Seljalandsfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_189-191_HDR.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "mountain",
    "title": "Mountain reflections",
    "alt": "View from the southwest across Lake Siskiyou in Northern California to Mount Shasta, with the Wagon Creek footbridge on the left. At 4317 m, the stratovolcano is the second-highest peak of the Cascade Range.",
    "url": "/nature/mountain.webp",
    "recommended": "ancient-forest",
    "author": "Radomianin",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Shasta,_Lake_Siskiyou,_SW_view.jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/8/82/Mount_Shasta%2C_Lake_Siskiyou%2C_SW_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "winter",
    "title": "Quiet alpine landscape",
    "alt": "peyto lake alberta canada winter panorama 2006",
    "url": "/nature/winter.webp",
    "recommended": "night-rain",
    "author": "chensiyuan",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:1_Peyto_lake_panorama_2006.jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/7/7b/1_Peyto_lake_panorama_2006.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  },
  {
    "id": "woodland",
    "title": "Woodland landscape",
    "alt": "",
    "url": "/nature/woodland.webp",
    "recommended": "forest-rain",
    "author": "Smilla Heckel",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Black_Forest_landscape_national_Parc.jpg",
    "original": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Black_Forest_landscape_national_Parc.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "modifications": "Resized to 1600 px wide and encoded as WebP. Display may crop to fit."
  }
];
export function dailyLandscape(date){const index=Math.floor(Date.parse(date+"T00:00:00Z")/86400000);return landscapes[((index%landscapes.length)+landscapes.length)%landscapes.length];}
