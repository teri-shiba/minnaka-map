class Operator < ApplicationRecord
  has_many :stations, dependent: :destroy

  validates :name, presence: true
  validates :alias_name, presence: true
  validates :uuid, presence: true, uniqueness: true

  before_validation :ensure_alias_name

  def display_name
    alias_name.presence || name
  end

  private

    def ensure_alias_name
      self.alias_name = name if alias_name.blank?
    end
end
