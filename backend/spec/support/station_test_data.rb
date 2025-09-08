module StationTestData
  STATIONS = {
    tokyo: {
      name: "東京",
      name_hiragana: "とうきょう",
      name_romaji: "tokyo",
      latitude: "35.68128",
      longitude: "139.76682",
    },
    ueno: {
      name: "上野",
      name_hiragana: "うえの",
      name_romaji: "ueno",
      latitude: "35.71275",
      longitude: "139.77661",
    },
    kanda: {
      name: "神田",
      name_hiragana: "かんだ",
      name_romaji: "kanda",
      latitude: "35.69242",
      longitude: "139.77088",
    },
    meguro: {
      name: "目黒",
      name_hiragana: "めぐろ",
      name_romaji: "meguro",
      latitude: "35.63298",
      longitude: "139.71570",
    },

    # TODO: 上に統一する
    matsudo: { name: "松戸", name_hiragana: "まつど", name_romaji: "matsudo", latitude: 35.78458, longitude: 139.90083 },
    matsudo_shinden: { name: "松戸新田", name_hiragana: "まつどしんでん", name_romaji: "matsudoshinden", latitude: 35.79066, longitude: 139.92233 },
    osaka: { name: "大阪", name_hiragana: "おおさか", name_romaji: "oosaka", latitude: 34.70252, longitude: 135.49466 },
    nagoya: { name: "名古屋", name_hiragana: "なごや", name_romaji: "nagoya", latitude: 35.17103, longitude: 136.88175 },
  }.freeze
end
