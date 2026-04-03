export const locations = [
  // Скайрим (Skyrim)
  { id: 'solitude', name: 'Солитьюд', description: 'Гордая столица Скайрима, возвышающаяся на каменной арке.', region: 'Skyrim', isSafe: true },
  { id: 'windhelm', name: 'Виндхельм', description: 'Древний город королей, укрытый снегом и хранящий старые обиды.', region: 'Skyrim', isSafe: true },
  { id: 'whiterun', name: 'Вайтран', description: 'Торговый центр Скайрима, город среди бескрайней тундры.', region: 'Skyrim', isSafe: true },
  { id: 'markarth', name: 'Маркарт', description: 'Город из камня, где кровь и серебро текут по улицам.', region: 'Skyrim', isSafe: true },
  { id: 'riften', name: 'Рифтен', description: 'Город каналов и теней, дом для тех, кто предпочитает действовать скрытно.', region: 'Skyrim', isSafe: true },
  { id: 'dawnstar', name: 'Данстар', description: 'Холодный портовый город, часто страдающий от дурных снов.', region: 'Skyrim', isSafe: true },
  { id: 'winterhold', name: 'Винтерхолд', description: 'Город, ушедший под воду, оставив лишь Коллегию и несколько домов.', region: 'Skyrim', isSafe: true },
  { id: 'morthal', name: 'Морфал', description: 'Мрачное поселение среди болот, полное тайн.', region: 'Skyrim', isSafe: true },
  { id: 'falkreath', name: 'Фолкрит', description: 'Город, известный своим огромным кладбищем и вечным туманом.', region: 'Skyrim', isSafe: true },
  { id: 'riverwood', name: 'Ривервуд', description: 'Тихая деревня лесорубов у подножия Глотки Мира.', region: 'Skyrim', isSafe: true },
  { id: 'ivarstead', name: 'Айварстед', description: 'Остановка для паломников, идущих к Седобородым.', region: 'Skyrim', isSafe: true },
  { id: 'rorikstead', name: 'Рорикстед', description: 'Фермерское поселение, которое почему-то всегда собирает богатый урожай.', region: 'Skyrim', isSafe: true },

  // Окрестности и Подземелья
  { id: 'whiterun_outskirts', name: 'Окрестности Вайтрана', description: 'Широкие равнины, патрулируемые стражниками и иногда великанами.', region: 'Skyrim', isSafe: false },
  { id: 'bleak_falls_barrow', name: 'Ветреный пик', description: 'Древние нордские руины, нависающие над Ривервудом.', region: 'Skyrim', isSafe: false },
  { id: 'forgotten_crypt', name: 'Забытый Склеп', description: 'Темное и сырое место, полное нежити и пыли.', region: 'Skyrim', isSafe: false },

  // Абсурдные локации (малая часть)
  { id: 'sweet_roll_bakery', name: 'Тайная пекарня рулетов', description: 'Говорят, сюда свозят все украденные сладкие рулеты Тамриэля.', region: 'Unknown', isSafe: true },
  { id: 'cheese_mountain', name: 'Сырный пик', description: 'Странная гора, запах от которой привлекает крыс со всего Скайрима.', region: 'Unknown', isSafe: false }
];

export function getRandomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

export function getLocationsByRegion(region: string) {
  return locations.filter(loc => loc.region === region);
}
