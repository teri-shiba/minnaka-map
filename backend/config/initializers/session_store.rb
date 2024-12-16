Rails.application.config.session_store :cookie_store,
  key: '_session_id',
  httponly: true,
  secure: Rails.env.production?, # 本番環境でのみSecure属性を有効化
  same_site: :lax,
  expire_after: 30.minutes