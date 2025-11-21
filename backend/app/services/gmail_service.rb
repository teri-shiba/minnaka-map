require "google/apis/gmail_v1"
require "googleauth"

class GmailService
  Gmail = Google::Apis::GmailV1

  def initialize
    credentials = Rails.application.credentials.google
    @client_id = credentials[:client_id]
    @client_secret = credentials[:client_secret]
    @refresh_token = credentials[:refresh_token]
  end

  def get_verification_email(email, timeout_seconds: 60)
    gmail = authenticate_gmail
    start_time = Time.current

    while Time.current - start_time < timeout_seconds
      link = find_verification_link(gmail, email)
      return link if link

      sleep 2
    end

    nil
  end

  private

    def find_verification_link(gmail, email)
      messages = fetch_messages(gmail, email)
      return nil if messages.messages.blank?

      message_id = messages.messages.first.id
      message = gmail.get_user_message("me", message_id, format: "full")
      body = extract_message_body(message)

      extract_confirmation_link(body)
    end

    def fetch_messages(gmail, email)
      gmail.list_user_messages(
        "me",
        q: "to:#{email} subject:メールアドレス確認メール newer_than:1h",
        max_results: 1,
      )
    end

    def extract_confirmation_link(body)
      base_url = Settings.front_domain
      pattern = %r{#{Regexp.escape(base_url)}/\?confirmation_token=[^\s"]+}
      match = body.match(pattern)
      match&.[](0)
    end

    def authenticate_gmail
      authorizer = Google::Auth::UserRefreshCredentials.new(
        client_id: @client_id,
        client_secret: @client_secret,
        scope: ["https://www.googleapis.com/auth/gmail.readonly"],
        refresh_token: @refresh_token,
      )

      service = Gmail::GmailService.new
      service.authorization = authorizer
      service
    end

    def extract_message_body(message)
      if message.payload.parts
        parts = message.payload.parts.flat_map do |part|
          extract_part_body(part)
        end
        parts.compact.join
      elsif message.payload.body&.data
        message.payload.body.data
      else
        ""
      end
    end

    def extract_part_body(part)
      if part.parts
        part.parts.map {|p| extract_part_body(p) }
      elsif part.body&.data && (part.mime_type == "text/plain" || part.mime_type == "text/html")
        part.body.data
      end
    end
end
