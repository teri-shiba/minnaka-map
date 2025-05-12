class Operator < ApplicationRecord
  has_many :stations, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :alias_name, presence: true

  before_validation :ensure_alias_name

  def display_name
    alias_name.presence || name
  end

  private

    def ensure_alias_name
      self.alias_name = name if alias_name.blank?
    end
end
