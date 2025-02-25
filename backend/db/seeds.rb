ActiveRecord::Base.transaction do
  user = User.create!(name: "テスト太郎")

  UserAuth.create!(
    email: "test1@example.com",
    password: "lGP$AC354353K@hFcT,I",
    confirmed_at: Time.current,
    user_id: user.id,
  )

  prefectures = %w[
    北海道 青森県 秋田県 岩手県 宮城県 山形県 福島県
    栃木県 茨城県 群馬県 埼玉県 千葉県 東京都 神奈川県
    新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県
    三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県
    鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県
    福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県
  ]

  prefectures.each do |prefecture|
    Prefecture.create!(name: prefecture)
  end

  Location.create!(
    place_id: "ChIJm1vMbuPxGGARynXLPQyt-Dk",
    latitude: 35.68838,
    longitude: 139.59804,
    locality: "杉並区",
    sublocality: "久我山",
    place_type: "address",
    prefecture_id: Prefecture.find_by(name: "東京都").id,
  )
end
