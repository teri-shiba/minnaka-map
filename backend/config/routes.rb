Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  namespace :api do
    namespace :v1 do
      get "health_check", to: "health_check#index"
      mount_devise_token_auth_for "UserAuth", at: "auth", controllers: {
        omniauth_callbacks: "api/v1/auth/omniauth_callbacks",
        registrations: "api/v1/overrides/registrations",
        sessions: "api/v1/auth/sessions",
      }
      get "googlemaps/api_key", to: "googlemaps#api_key"

      resources :stations, only: [:index]

      namespace :user do
        resource :confirmations, only: [:update]
      end
      namespace :current do
        resource :user, only: [:show] do
          get :show_status, on: :member
        end
      end
    end
  end
end
