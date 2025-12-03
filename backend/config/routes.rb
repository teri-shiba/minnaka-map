Rails.application.routes.draw do
  get "/health", to: proc {
    [
      200,
      { "Content-Type" => "application/json" },
      ['{"status":"ok"}'],
    ]
  }
  
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  namespace :api do
    namespace :v1 do
      resources :api_keys, only: [:show], param: :service
      mount_devise_token_auth_for "UserAuth", at: "auth", controllers: {
        omniauth_callbacks: "api/v1/auth/omniauth_callbacks",
        registrations: "api/v1/overrides/registrations",
      }

      resources :stations, only: [:index]
      resource :midpoint, only: [:show] do
        get :validate
      end

      resources :favorite_tokens, only: [] do
        collection do
          post :batch
          post :decode
        end
      end

      resources :search_histories, only: [:create]
      resources :favorites, only: [:index, :create, :destroy] do
        collection do
          get :status
          post :by_search_history
        end
      end
      resources :shared_favorite_lists, only: [:create, :show], param: :share_uuid

      namespace :user do
        resource :confirmations, only: [:update]
      end

      namespace :current do
        resource :user, only: [:show] do
          get :show_status
        end
      end

      resource :test_helpers, only: [] do
        post :verification_email
      end
    end
  end
end
