import * as THREE from 'three';
import { ToyModelInfo } from '../types';

export const TOYBOX_MODELS: ToyModelInfo[] = [
  // 1. Cute Animals & Kawaii Friends (9 models)
  {
    id: 'pusheen_classic',
    name: 'Classic Pusheen',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🐱',
    description: 'Chubby grey tabby cat with cute whiskers & tiny paws',
    subParts: ['Cat Body', 'Ears', 'Stripes', 'Tail', 'Whiskers', 'Paws'],
    scale: 1.2,
    polyCount: 1420,
    tags: ['cat', 'pusheen', 'cute', 'animal'],
    file: '/models/pusheen_classic.glb',
  },
  {
    id: 'pusheen_busy',
    name: 'Pusheen at Laptop',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '💻',
    description: 'Pusheen typing furiously on a mini pink toy laptop',
    subParts: ['Cat Body', 'Laptop', 'Screen', 'Coffee Cup', 'Desk'],
    scale: 1.2,
    polyCount: 1840,
    tags: ['cat', 'laptop', 'work', 'kawaii'],
    file: '/models/pusheen_busy.glb',
  },
  {
    id: 'pusheen_vs_noodle',
    name: 'Pusheen Ramen Bowl',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🍜',
    description: 'Pusheen happily sitting inside a warm noodle ramen bowl',
    subParts: ['Ramen Bowl', 'Cat Body', 'Noodles', 'Egg', 'Chopsticks'],
    scale: 1.3,
    polyCount: 2100,
    tags: ['ramen', 'food', 'cat', 'cozy'],
    file: '/models/pusheen_vs_noodle.glb',
  },
  {
    id: 'capybara_bath',
    name: 'Capybara Onsen Bath',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '♨️',
    description: 'Chill capybara soaking in a wooden hot spring with yuzu fruit',
    subParts: ['Capybara', 'Wooden Tub', 'Water Surface', 'Yuzu Orange', 'Towel'],
    scale: 1.25,
    polyCount: 1650,
    tags: ['capybara', 'onsen', 'bath', 'chill'],
    file: '/models/capybara_bath.glb',
  },
  {
    id: 'capybara_cute',
    name: 'Cute Standing Capybara',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🦫',
    description: 'Friendly standing capybara wearing a tiny sprout hat',
    subParts: ['Capybara Body', 'Sprout Hat', 'Snout', 'Little Feet'],
    scale: 1.2,
    polyCount: 1380,
    tags: ['capybara', 'standing', 'cute'],
    file: '/models/capybara_cute.glb',
  },
  {
    id: 'chonky_axolotl',
    name: 'Chonky Axolotl',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🦎',
    description: 'Baby pink water dragon with frilly gills & sweet smile',
    subParts: ['Axolotl Body', 'Frilly Gills', 'Tail Fin', 'Cheeks', 'Little Hands'],
    scale: 1.2,
    polyCount: 1720,
    tags: ['axolotl', 'pink', 'water', 'cute'],
    file: '/models/chonky_axolotl.glb',
  },
  {
    id: 'cat_cuddly_toy',
    name: 'Kawaii Cat Plush',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🧸',
    description: 'Squishy anime plushie with bell collar and ribbon bow',
    subParts: ['Plush Body', 'Bell Collar', 'Ribbon Bow', 'Soft Ears', 'Tail'],
    scale: 1.15,
    polyCount: 1290,
    tags: ['plush', 'toy', 'anime', 'cat'],
    file: '/models/cat_cuddly_toy_manga_anime_otaku_kawaii.glb',
  },
  {
    id: 'pompompurin',
    name: 'Pompompurin Buddy',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🐾',
    description: 'Round fluffy golden puppy wearing a brown beret',
    subParts: ['Puppy Body', 'Brown Beret', 'Floppy Ears', 'Little Nose'],
    scale: 1.2,
    polyCount: 1150,
    tags: ['dog', 'pompom', 'kawaii', 'beret'],
    file: '/models/pompompurin.glb',
  },
  {
    id: 'this_model_is_cute',
    name: 'Cute & Kawaii Friend',
    category: 'animals',
    categoryName: 'Cute Animals',
    icon: '🎀',
    description: 'Super kawaii friendly companion ready to be painted',
    subParts: ['Head', 'Body', 'Limbs', 'Accessories'],
    scale: 1.2,
    polyCount: 1500,
    tags: ['cute', 'kawaii', 'companion', 'sweet'],
    file: '/models/this_model_is_cute_and_kawaii.glb',
  },

  // 2. Pokémon & Anime Heroes (16 models)
  {
    id: 'bulbasaur',
    name: 'Bulbasaur Buddy',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🌱',
    description: 'Grass starter seed pokemon with plant bulb on its back',
    subParts: ['Bulbasaur Body', 'Green Bulb', 'Ear Ridges', 'Body Spots', 'Claws'],
    scale: 1.2,
    polyCount: 1980,
    tags: ['pokemon', 'bulbasaur', 'grass', 'starter'],
    file: '/models/bulbasaur_-_pokemon.glb',
  },
  {
    id: 'charmander',
    name: 'Charmander Flame',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🔥',
    description: 'Energetic fire lizard with blazing tail flame',
    subParts: ['Lizard Body', 'Cream Belly', 'Tail Flame', 'Bright Eyes', 'Claws'],
    scale: 1.2,
    polyCount: 1890,
    tags: ['pokemon', 'charmander', 'fire', 'starter'],
    file: '/models/charmanderpokemon.glb',
  },
  {
    id: 'charizard',
    name: 'Charizard Dragon',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🐉',
    description: 'Majestic flying flame dragon with giant teal wings',
    subParts: ['Dragon Body', 'Teal Wings', 'Tail Flame', 'Horns', 'Snout'],
    scale: 1.35,
    polyCount: 3200,
    tags: ['pokemon', 'charizard', 'dragon', 'flying'],
    file: '/models/charizardpokemon.glb',
  },
  {
    id: 'ninetales',
    name: 'Ninetales Fox',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🦊',
    description: 'Mystical golden kitsune with nine flowing tails',
    subParts: ['Fox Body', 'Nine Tails', 'Head Crest', 'Mane', 'Red Eyes'],
    scale: 1.3,
    polyCount: 2800,
    tags: ['pokemon', 'ninetales', 'kitsune', 'tails'],
    file: '/models/ninetalespokemon.glb',
  },
  {
    id: 'cherubi',
    name: 'Cherubi Cherry',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🍒',
    description: 'Cute twin cherry pokemon with green leaf stem',
    subParts: ['Main Cherry', 'Little Baby Cherry', 'Leaf Stem', 'Feet'],
    scale: 1.1,
    polyCount: 1100,
    tags: ['pokemon', 'cherubi', 'cherry', 'fruit'],
    file: '/models/lowpoly_pokemon_cherubi.glb',
  },
  {
    id: 'ash_ketchum',
    name: 'Ash Ketchum Trainer',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🧢',
    description: 'Pokemon master hero with red trainer cap & jacket',
    subParts: ['Trainer Cap', 'Jacket', 'Pants', 'Sneakers', 'Gloves'],
    scale: 1.35,
    polyCount: 2600,
    tags: ['trainer', 'ash', 'hero', 'anime'],
    file: '/models/ash_ketchup_-_pokemon.glb',
  },
  {
    id: 'krillin',
    name: 'Krillin Martial Artist',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🥋',
    description: 'Iconic brave martial artist hero in orange training uniform',
    subParts: ['Head & Dots', 'Orange Gi', 'Blue Sash', 'Boots', 'Bracers'],
    scale: 1.25,
    polyCount: 2300,
    tags: ['krillin', 'dragonball', 'anime', 'hero'],
    file: '/models/krillin.glb',
  },
  {
    id: 'son_goku',
    name: 'Goku on Flying Nimbus',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '☁️',
    description: 'Young hero flying through the sky on golden cloud nimbus',
    subParts: ['Hero Boy', 'Golden Cloud', 'Power Pole', 'Gi Uniform', 'Hair'],
    scale: 1.3,
    polyCount: 2750,
    tags: ['goku', 'nimbus', 'anime', 'flying'],
    file: '/models/son_goku_and_kintoun_nimbus.glb',
  },
  {
    id: 'sailormoon',
    name: 'Sailor Moon Magical Bun',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🌙',
    description: 'Magical guardian girl with twin golden bun pigtails',
    subParts: ['Sailor Dress', 'Twin Pigtails', 'Tiara Jewel', 'Ribbon Bow', 'Boots'],
    scale: 1.35,
    polyCount: 2900,
    tags: ['sailormoon', 'magical', 'anime', 'star'],
    file: '/models/sailormoon_casual_bun.glb',
  },
  {
    id: 'shinobu_oshino',
    name: 'Shinobu Oshino',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '👒',
    description: 'Stylized anime character with yellow sundress and straw hat',
    subParts: ['Straw Hat', 'Sundress', 'Golden Hair', 'Ribbon', 'Sandals'],
    scale: 1.3,
    polyCount: 3100,
    tags: ['shinobu', 'anime', 'dress', 'hat'],
    file: '/models/shinobu_oshino.glb',
  },
  {
    id: 'reg_riko_nanachi',
    name: 'Abyss Explorers Trio',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🧭',
    description: 'Three brave adventurers setting off into the mysterious abyss',
    subParts: ['Explorers Group', 'Helmets', 'Robotic Arms', 'Backpacks', 'Compass'],
    scale: 1.35,
    polyCount: 4200,
    tags: ['abyss', 'adventurers', 'anime', 'trio'],
    file: '/models/reg_riko_nanachi_from_made_in_abyss.glb',
  },
  {
    id: 'matilda',
    name: 'Matilda Character',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '👧',
    description: 'Cute stylized character with colorful outfit and accessories',
    subParts: ['Character Body', 'Outfit', 'Hair', 'Boots'],
    scale: 1.25,
    polyCount: 2400,
    tags: ['matilda', 'character', 'stylized', 'girl'],
    file: '/models/matilda.glb',
  },
  {
    id: 'boxy_lankybox_2',
    name: 'Boxy Pal (Box Edition)',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '📦',
    description: 'Cardboard box hero friend with friendly smile & tape handle',
    subParts: ['Cardboard Body', 'Top Flaps', 'Tape Badge', 'Stick Legs'],
    scale: 1.2,
    polyCount: 1600,
    tags: ['boxy', 'box', 'cartoon', 'lankybox'],
    file: '/models/boxy_lankybox (2).glb',
  },
  {
    id: 'boxy_lankybox_3',
    name: 'Boxy Pal (Smile Edition)',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '📦',
    description: 'Smiling square box companion with bold pop colors',
    subParts: ['Square Shell', 'Eyes & Smile', 'Handle Flap'],
    scale: 1.2,
    polyCount: 1550,
    tags: ['boxy', 'box', 'cartoon', 'lankybox'],
    file: '/models/boxy_lankybox (3).glb',
  },
  {
    id: 'foxy_lankybox',
    name: 'Foxy Pal Fox',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🦊',
    description: 'Orange plush fox wearing a cozy purple hoodie & cape',
    subParts: ['Fox Body', 'Purple Hood', 'Bushy Tail', 'Snout', 'White Chest'],
    scale: 1.2,
    polyCount: 1850,
    tags: ['foxy', 'fox', 'hoodie', 'lankybox'],
    file: '/models/foxy_lankybox.glb',
  },
  {
    id: 'foxy_lankybox_1',
    name: 'Foxy Plush Edition',
    category: 'cartoons',
    categoryName: 'Pokémon & Cartoons',
    icon: '🦊',
    description: 'Plush squishy edition of Foxy with cute round proportions',
    subParts: ['Plush Body', 'Hoodie', 'Fox Ears', 'Fluffy Tail'],
    scale: 1.2,
    polyCount: 1900,
    tags: ['foxy', 'plush', 'cute', 'lankybox'],
    file: '/models/foxy_lankybox (1).glb',
  },

  // 3. Fairytale Houses & Buildings (8 models)
  {
    id: 'korean_bakery',
    name: 'Pastry Bakery Cafe',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🥐',
    description: 'Sweet bakery shop with striped awning, cake displays & cafe sign',
    subParts: ['Bakery Building', 'Striped Awning', 'Cake Showcase', 'Signboard', 'Door'],
    scale: 1.35,
    polyCount: 2700,
    tags: ['bakery', 'cafe', 'pastry', 'shop'],
    file: '/models/korean_bakery.glb',
  },
  {
    id: 'pawtisserie',
    name: 'Pawtisserie Pet Cafe',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🐾',
    description: 'Charming pastel animal bakery cafe with paw-print decorations',
    subParts: ['Bakery Wall', 'Roof Tiles', 'Paw Awnings', 'Display Shelf', 'Benches'],
    scale: 1.3,
    polyCount: 2600,
    tags: ['pawtisserie', 'cafe', 'bakery', 'pets'],
    file: '/models/pawtisserie.glb',
  },
  {
    id: 'fantasy_house',
    name: 'Fairytale Mushroom House',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🍄',
    description: 'Cozy red mushroom cottage with stone chimney & wooden door',
    subParts: ['Mushroom Roof', 'House Wall', 'Chimney', 'Round Door', 'Flower Windows'],
    scale: 1.3,
    polyCount: 2200,
    tags: ['house', 'fairytale', 'cottage', 'magic'],
    file: '/models/fantasy_house.glb',
  },
  {
    id: 'isometric_castle',
    name: 'Isometric Fantasy Castle',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🏰',
    description: 'Magical kingdom fortress with conical towers, flags & drawbridge',
    subParts: ['Main Keep', 'Turret Towers', 'Conical Roofs', 'Castle Flags', 'Drawbridge'],
    scale: 1.4,
    polyCount: 3100,
    tags: ['castle', 'kingdom', 'fortress', 'magic'],
    file: '/models/isometric_fantasy_castle.glb',
  },
  {
    id: 'medieval_house',
    name: 'Medieval Timber Cottage',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🏘️',
    description: 'Stylized timber-frame storybook cottage with slate roof',
    subParts: ['Slate Roof', 'Timber Beams', 'Plaster Walls', 'Stone Porch', 'Lantern'],
    scale: 1.3,
    polyCount: 2400,
    tags: ['medieval', 'timber', 'house', 'village'],
    file: '/models/stylized_medieval_house.glb',
  },
  {
    id: 'car_house',
    name: 'Camper Van Mobile Home',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🚐',
    description: 'Retro pastel road-trip camper van with roof luggage & awning',
    subParts: ['Van Body', 'Roof Awning', 'Tires & Rims', 'Headlights', 'Surfboard'],
    scale: 1.35,
    polyCount: 2150,
    tags: ['van', 'camper', 'trip', 'retro'],
    file: '/models/car_house.glb',
  },
  {
    id: 'house',
    name: 'Modern Village Cottage',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🏡',
    description: 'Clean contemporary village cottage with pitched gable roof',
    subParts: ['Cottage Body', 'Gable Roof', 'Front Porch', 'Windows', 'Chimney'],
    scale: 1.3,
    polyCount: 2050,
    tags: ['house', 'village', 'cottage', 'home'],
    file: '/models/house.glb',
  },
  {
    id: 'halloween',
    name: 'Halloween Spooky Manor',
    category: 'houses',
    categoryName: 'Fairytale Architecture',
    icon: '🎃',
    description: 'Fun spooky gothic manor house adorned with glowing jack-o-lanterns',
    subParts: ['Spooky Roof', 'Gothic Walls', 'Pumpkins', 'Bat Weather-Vane', 'Gate'],
    scale: 1.35,
    polyCount: 2800,
    tags: ['halloween', 'spooky', 'manor', 'pumpkin'],
    file: '/models/halloween.glb',
  },

  // 4. Cyber Vehicles & Tech Gadgets (4 models)
  {
    id: 'akira_bike',
    name: 'Kaneda Cyber Motorcycle',
    category: 'vehicles',
    categoryName: 'Cyber Vehicles',
    icon: '🏍️',
    description: 'Legendary scarlet futuristic cyber motorcycle with aerodynamic decals',
    subParts: ['Red Fairing', 'Front Canopy', 'Wheel Hubs', 'Exhaust Pipes', 'Cockpit Seat'],
    scale: 1.35,
    polyCount: 3800,
    tags: ['akira', 'cyberpunk', 'motorcycle', 'bike'],
    file: '/models/akira_bike.glb',
  },
  {
    id: 'kanedas_bike_akira',
    name: 'Kaneda Bike (Classic Ed.)',
    category: 'vehicles',
    categoryName: 'Cyber Vehicles',
    icon: '🏍️',
    description: 'Classic high-fidelity edition of the iconic cyberpunk Akira motorcycle',
    subParts: ['Fairing Shell', 'Tires', 'Instrument HUD', 'Engine Block'],
    scale: 1.35,
    polyCount: 3900,
    tags: ['akira', 'bike', 'motorcycle', 'classic'],
    file: '/models/kanedas_bike_akira.glb',
  },
  {
    id: 'akira_motorcycle',
    name: 'Cyber Speed Bike (Alt)',
    category: 'vehicles',
    categoryName: 'Cyber Vehicles',
    icon: '🏎️',
    description: 'Ultra-aerodynamic streamliner street racing cyber motorcycle',
    subParts: ['Streamliner Body', 'Twin Wheels', 'Laser Headlights', 'Tail Fin'],
    scale: 1.3,
    polyCount: 3200,
    tags: ['cyber', 'speed', 'racing', 'bike'],
    file: '/models/akira_motorcycle.glb',
  },
  {
    id: 'psx_saviola_s21',
    name: 'PSX Seaplane S-21',
    category: 'vehicles',
    categoryName: 'Cyber Vehicles',
    icon: '✈️',
    description: 'Retro PlayStation 1 aesthetic vintage seaplane with pontoons and propeller',
    subParts: ['Fuselage', 'Twin Wings', 'Pontoon Floats', 'Spinning Propeller', 'Cockpit'],
    scale: 1.3,
    polyCount: 2200,
    tags: ['plane', 'seaplane', 'retro', 'psx'],
    file: '/models/psx_saviola_s21.glb',
  },

  // 5. Shapes & Free Canvases (6 models)
  {
    id: 'drawing_plane',
    name: '3D Drawing Easel Canvas',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '🎨',
    description: 'Curved open 3D easel canvas ready for free spatial painting',
    subParts: ['Canvas Surface', 'Wooden Frame', 'Tripod Legs', 'Brush Shelf'],
    scale: 1.3,
    polyCount: 800,
    tags: ['easel', 'canvas', 'sheet', 'drawing'],
  },
  {
    id: 'donut_torus',
    name: 'Glazed Donut Torus',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '🍩',
    description: 'Plump golden donut with wavy sugar glaze topping',
    subParts: ['Donut Dough', 'Sugar Glaze Frosting', 'Rainbow Sprinkles'],
    scale: 1.2,
    polyCount: 1200,
    tags: ['donut', 'torus', 'food', 'shape'],
  },
  {
    id: 'capsule_pill',
    name: 'Cyber Pill Capsule',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '💊',
    description: 'Two-tone rounded capsule medicine pill with center ring',
    subParts: ['Top Dome', 'Bottom Dome', 'Center Ring Band'],
    scale: 1.15,
    polyCount: 950,
    tags: ['capsule', 'pill', 'shape'],
  },
  {
    id: 'torus_knot',
    name: 'Interlocking Torus Knot',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '🥨',
    description: 'Continuous curving mathematical ribbon knot',
    subParts: ['Main Ribbon Knot', 'Accent Ring', 'Center Core'],
    scale: 1.25,
    polyCount: 2200,
    tags: ['knot', 'math', 'ribbon', 'complex'],
  },
  {
    id: 'ceramic_vase',
    name: 'Classical Ceramic Vase',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '🏺',
    description: 'Elegant curvy pottery vase with twin loop handles',
    subParts: ['Vase Vessel', 'Neck Rim', 'Left Loop Handle', 'Right Loop Handle', 'Foot Base'],
    scale: 1.3,
    polyCount: 1600,
    tags: ['vase', 'pottery', 'ceramic', 'decor'],
  },
  {
    id: 'sculpted_bust',
    name: 'Toy Head Sculpt',
    category: 'shapes',
    categoryName: 'Shapes & Canvases',
    icon: '🗿',
    description: 'Friendly stylized mannequin bust head for custom faces',
    subParts: ['Head Form', 'Neck & Shoulders', 'Pedestal Base'],
    scale: 1.25,
    polyCount: 1400,
    tags: ['bust', 'head', 'sculpture', 'mannequin'],
  },
];

/**
 * Procedural 3D Toy Geometry Builder (Fallback Generator)
 * Constructs clean, high-fidelity Three.js Group objects with distinct sub-meshes
 */
export function buildToyModelGroup(info: ToyModelInfo): THREE.Group {
  const group = new THREE.Group();
  group.name = `Toy_${info.id}`;

  const standardMat = (color: number, roughness = 0.35, metalness = 0.05) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      side: THREE.DoubleSide,
    });

  if (info.id === 'drawing_plane') {
    // 3D Drawing Canvas Easel
    const canvasGeo = new THREE.BoxGeometry(2.4, 1.8, 0.08);
    const canvasMesh = new THREE.Mesh(canvasGeo, standardMat(0xffffff, 0.9, 0.0));
    canvasMesh.name = 'Canvas Surface';
    canvasMesh.position.set(0, 1.2, 0);
    canvasMesh.castShadow = true;
    canvasMesh.receiveShadow = true;
    group.add(canvasMesh);

    const frameGeo = new THREE.BoxGeometry(2.55, 1.95, 0.05);
    const frameMesh = new THREE.Mesh(frameGeo, standardMat(0xd4a373, 0.8, 0.1));
    frameMesh.name = 'Wooden Frame';
    frameMesh.position.set(0, 1.2, -0.04);
    group.add(frameMesh);

    const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
    const leg1 = new THREE.Mesh(standGeo, standardMat(0xbc6c25, 0.7, 0.1));
    leg1.name = 'Tripod Leg Left';
    leg1.position.set(-0.9, 0.8, -0.2);
    leg1.rotation.z = 0.15;
    leg1.rotation.x = -0.15;
    group.add(leg1);

    const leg2 = leg1.clone();
    leg2.name = 'Tripod Leg Right';
    leg2.position.set(0.9, 0.8, -0.2);
    leg2.rotation.z = -0.15;
    group.add(leg2);

    const leg3 = leg1.clone();
    leg3.name = 'Tripod Leg Back';
    leg3.position.set(0, 0.8, -0.6);
    leg3.rotation.z = 0;
    leg3.rotation.x = -0.35;
    group.add(leg3);
    return group;
  }

  if (info.id === 'donut_torus') {
    // Glazed Donut
    const doughGeo = new THREE.TorusGeometry(1.0, 0.45, 28, 48);
    const doughMesh = new THREE.Mesh(doughGeo, standardMat(0xe0a96d, 0.6, 0.05));
    doughMesh.name = 'Donut Dough';
    doughMesh.position.y = 1.0;
    doughMesh.rotation.x = Math.PI * 0.5;
    doughMesh.castShadow = true;
    doughMesh.receiveShadow = true;
    group.add(doughMesh);

    const glazeGeo = new THREE.TorusGeometry(1.0, 0.47, 24, 48, Math.PI * 2);
    const glazeMesh = new THREE.Mesh(glazeGeo, standardMat(0xff70b8, 0.2, 0.1));
    glazeMesh.name = 'Sugar Glaze Frosting';
    glazeMesh.position.y = 1.05;
    glazeMesh.rotation.x = Math.PI * 0.5;
    group.add(glazeMesh);
    return group;
  }

  if (info.id === 'capsule_pill') {
    // Cyber Pill Capsule
    const topGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const topMesh = new THREE.Mesh(topGeo, standardMat(0xff2a6d, 0.25, 0.1));
    topMesh.name = 'Top Pink Dome';
    topMesh.position.y = 1.35;
    topMesh.castShadow = true;
    group.add(topMesh);

    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.8, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, standardMat(0x00f0ff, 0.25, 0.1));
    bodyMesh.name = 'Center Cyan Barrel';
    bodyMesh.position.y = 0.95;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    const btmGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const btmMesh = new THREE.Mesh(btmGeo, standardMat(0xffe600, 0.25, 0.1));
    btmMesh.name = 'Bottom Yellow Dome';
    btmMesh.position.y = 0.55;
    btmMesh.castShadow = true;
    group.add(btmMesh);
    return group;
  }

  if (info.id === 'torus_knot') {
    const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.28, 128, 32, 2, 3);
    const knotMesh = new THREE.Mesh(knotGeo, standardMat(0x8fa2fa, 0.3, 0.2));
    knotMesh.name = 'Torus Knot Ribbon';
    knotMesh.position.y = 1.2;
    knotMesh.castShadow = true;
    knotMesh.receiveShadow = true;
    group.add(knotMesh);
    return group;
  }

  if (info.id === 'ceramic_vase') {
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = t * 2.0;
      const r = 0.35 + Math.sin(t * Math.PI) * 0.45 + (1 - t) * 0.2;
      points.push(new THREE.Vector2(r, y));
    }
    const vaseGeo = new THREE.LatheGeometry(points, 36);
    const vaseMesh = new THREE.Mesh(vaseGeo, standardMat(0xffffff, 0.2, 0.1));
    vaseMesh.name = 'Vase Vessel';
    vaseMesh.position.y = 0.05;
    vaseMesh.castShadow = true;
    vaseMesh.receiveShadow = true;
    group.add(vaseMesh);
    return group;
  }

  // Default Cute Character Sculpt Fallback
  const bodyGeo = new THREE.SphereGeometry(0.95, 36, 32);
  const bodyMesh = new THREE.Mesh(bodyGeo, standardMat(0xff85a1, 0.4, 0.05));
  bodyMesh.name = `${info.name} Body`;
  bodyMesh.position.y = 1.05;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Cute Ears
  const earGeo = new THREE.ConeGeometry(0.3, 0.55, 24);
  const leftEar = new THREE.Mesh(earGeo, standardMat(0xff5376, 0.4, 0.05));
  leftEar.name = 'Left Ear';
  leftEar.position.set(-0.5, 1.85, 0.1);
  leftEar.rotation.z = 0.25;
  leftEar.castShadow = true;
  group.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.name = 'Right Ear';
  rightEar.position.set(0.5, 1.85, 0.1);
  rightEar.rotation.z = -0.25;
  group.add(rightEar);

  // Cute Feet
  const footGeo = new THREE.SphereGeometry(0.26, 20, 20);
  const footL = new THREE.Mesh(footGeo, standardMat(0xff85a1, 0.5, 0.05));
  footL.name = 'Left Foot';
  footL.position.set(-0.45, 0.25, 0.4);
  group.add(footL);

  const footR = footL.clone();
  footR.name = 'Right Foot';
  footR.position.set(0.45, 0.25, 0.4);
  group.add(footR);

  return group;
}
