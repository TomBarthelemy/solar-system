/** Static display data (text, labels, stats) shown in the planet detail card. */

export interface PlanetDisplayData {
  displayName: string;
  type: string;
  description: string;
  diameter: string;
  distanceFromSun: string;
  moons: number | string;
  orbitalPeriod: string;
  temperature: string;
}

export const PLANET_DISPLAY_DATA: Record<string, PlanetDisplayData> = {
  SUN: {
    displayName: 'Soleil',
    type: 'Étoile - naine jaune G2V',
    description: 'Notre étoile, au cœur du système solaire. Elle représente 99,8 % de la masse totale du système et son énergie est produite par fusion nucléaire.',
    diameter: '1 392 700 km',
    distanceFromSun: '-',
    moons: '-',
    orbitalPeriod: '-',
    temperature: '5 500°C (surface) · ~15 M°C (cœur)',
  },
  MERCURE: {
    displayName: 'Mercure',
    type: 'Planète tellurique',
    description: 'La plus petite planète du système solaire et la plus proche du Soleil. Sans atmosphère significative, ses températures varient drastiquement.',
    diameter: '4 879 km',
    distanceFromSun: '57,9 millions km',
    moons: 0,
    orbitalPeriod: '88 jours',
    temperature: '-180°C à +430°C',
  },
  VENUS: {
    displayName: 'Vénus',
    type: 'Planète tellurique',
    description: "La planète la plus chaude du système solaire, enveloppée d'une épaisse atmosphère de CO₂ créant un effet de serre extrême.",
    diameter: '12 104 km',
    distanceFromSun: '108,2 millions km',
    moons: 0,
    orbitalPeriod: '225 jours',
    temperature: '+465°C (moyenne)',
  },
  EARTH: {
    displayName: 'Terre',
    type: 'Planète tellurique',
    description: "Notre maison. La seule planète connue à abriter la vie, avec de l'eau liquide en surface et une atmosphère riche en azote et oxygène.",
    diameter: '12 742 km',
    distanceFromSun: '149,6 millions km',
    moons: 1,
    orbitalPeriod: '365,25 jours',
    temperature: '-88°C à +58°C',
  },
  MARS: {
    displayName: 'Mars',
    type: 'Planète tellurique',
    description: 'La planète rouge. Elle abrite Olympus Mons, le plus grand volcan du système solaire, et Valles Marineris, le plus vaste canyon.',
    diameter: '6 779 km',
    distanceFromSun: '227,9 millions km',
    moons: 2,
    orbitalPeriod: '687 jours',
    temperature: '-143°C à +35°C',
  },
  JUPITER: {
    displayName: 'Jupiter',
    type: 'Géante gazeuse',
    description: 'La plus grande planète du système solaire. Sa Grande Tache Rouge est une tempête anticyclonique active depuis plus de 350 ans.',
    diameter: '139 820 km',
    distanceFromSun: '778,5 millions km',
    moons: 95,
    orbitalPeriod: '11,9 ans',
    temperature: '-110°C (nuages)',
  },
  SATURN: {
    displayName: 'Saturne',
    type: 'Géante gazeuse',
    description: "Célèbre pour ses spectaculaires anneaux composés de glace et de roches. La moins dense de toutes les planètes - plus légère que l'eau.",
    diameter: '116 460 km',
    distanceFromSun: '1 432 millions km',
    moons: 146,
    orbitalPeriod: '29,5 ans',
    temperature: '-140°C (nuages)',
  },
  URANUS: {
    displayName: 'Uranus',
    type: 'Géante de glace',
    description: 'Son axe de rotation est incliné à 98°, la faisant orbiter pratiquement "couchée sur le côté". Sa couleur cyan vient du méthane atmosphérique.',
    diameter: '50 724 km',
    distanceFromSun: '2 867 millions km',
    moons: 27,
    orbitalPeriod: '84 ans',
    temperature: '-224°C (nuages)',
  },
  NEPTUNE: {
    displayName: 'Neptune',
    type: 'Géante de glace',
    description: 'La planète la plus éloignée du Soleil. Ses vents sont les plus violents du système solaire, atteignant +2 000 km/h.',
    diameter: '49 244 km',
    distanceFromSun: '4 495 millions km',
    moons: 16,
    orbitalPeriod: '165 ans',
    temperature: '-218°C (nuages)',
  },
};
