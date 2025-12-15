Rails.application.configure do
  config.action_dispatch.default_headers["X-Frame-Options"] = "SAMEORIGIN"
  config.action_dispatch.default_headers["X-Content-Type-Options"] = "nosniff"
  config.action_dispatch.default_headers["X-XSS-Protection"] = "1; mode=block"
  config.action_dispatch.default_headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
end
