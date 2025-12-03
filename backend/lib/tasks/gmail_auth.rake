namespace :gmail do
  desc "Obtain Gmail API user refresh token via OAuth flow"

  task authenticate: :environment do
    require "googleauth"
    require "uri"

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

    puts "Open this URL in your browser:"
    puts url
    puts
    puts "After granting access, the browser will try to redirect to #{redirect_uri} (which will fail)."
    puts "Copy the full URL from the browser address bar and paste it here."
    puts "Example: http://localhost:8080/?code=4/0AY0e-g7...&scope=..."
    puts
    print "Paste the full redirected URL: "

    callback_url = $stdin.gets&.chomp.to_s

    if callback_url.empty?
      puts "No URL was provided. Aborting."
      exit 1
    end

    begin
      query_params = URI(callback_url).
                       yield_self {|uri| uri.query ? URI.decode_www_form(uri.query).to_h : {} }

      code = query_params["code"]

      if code.blank?
        puts "Authorization code ('code' parameter) could not be found in the URL. Aborting."
        exit 1
      end

      auth_client.code = code
      auth_client.fetch_access_token!
    rescue => e
      puts "Failed to exchange authorization code for tokens: #{e.class} - #{e.message}"
      exit 1
    end

    puts
    puts "Save this refresh_token into your Rails encrypted credentials (e.g., config/credentials.yml.enc):"
    puts auth_client.refresh_token
  end
end
