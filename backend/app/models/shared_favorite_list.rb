class SharedFavoriteList < ApplicationRecord
  belongs_to :user
  belongs_to :search_history

  scope :owned_by, ->(user) { where(user_id: user.respond_to?(:id) ? user.id : user) }
  scope :public_lists, -> { where(is_public: true) }

  validates :title, presence: true, length: { maximum: 255 }
  validates :share_uuid, presence: true, uniqueness: true
  validates :search_history_id,
            uniqueness: {
              scope: :user_id,
              message: "はすでに存在します",
            }

  before_validation :ensure_share_uuid, on: :create

  def to_param = share_uuid

  private

    def ensure_share_uuid
      self.share_uuid ||= SecureRandom.uuid
    end
end
