namespace :gmail do
  desc "Gmail API の認証トークンを取得"
  task authenticate: :environment do
    require "googleauth"

    credentials = Rails.application.credentials.google
    client_id = credentials[:client_id]
    client_secret = credentials[:client_secret]

    scope = "https://www.googleapis.com/auth/gmail.readonly"
    redirect_uri = "http://localhost:8080"

    auth_client = Google::Auth::UserRefreshCredentials.new(
      client_id:,
      client_secret:,
      scope:,
      redirect_uri:,
    )

    url = auth_client.authorization_uri.to_s

    puts "このURLをブラウザで開いてください:"
    puts url
    puts "\n認証後、ブラウザが localhost:8080 に接続しようとします（失敗します）"
    puts "アドレスバーの URL 全体をコピーして貼り付けてください"
    puts "例: http://localhost:8080/?code=4/0AY0e-g7...&scope=..."
    puts "\nURLを貼り付けてください:"

    callback_url = $stdin.gets.chomp
    code = URI.decode_www_form(URI(callback_url).query).to_h["code"]

    auth_client.code = code
    auth_client.fetch_access_token!

    puts "\nこの refresh_token を rails credentials に保存してください:"
    puts auth_client.refresh_token
  end
end
