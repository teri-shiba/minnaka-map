class Prefecture < ApplicationRecord
  has_many :locations, dependent: :destroy
end
