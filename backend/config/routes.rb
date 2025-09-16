Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  namespace :api do
    namespace :v1 do
      resources :api_keys, only: [:show], param: :service
      mount_devise_token_auth_for "UserAuth", at: "auth", controllers: {
        omniauth_callbacks: "api/v1/auth/omniauth_callbacks",
        registrations: "api/v1/overrides/registrations",
        sessions: "api/v1/auth/sessions",
      }

      resources :stations, only: [:index]
      resource :midpoint, only: [:create] do
        get :validate
      end

      resources :search_histories, only: [:create]
      resources :favorites, only: [:index, :create, :destroy] do
        collection { get :status }
      end
      resources :shared_favorite_lists, only: [:create, :show], param: :share_uuid

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
