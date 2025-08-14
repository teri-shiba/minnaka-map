class SharedFavoriteList < ApplicationRecord
  belongs_to :user
  belongs_to :search_history

  validates :title, presence: true, length: { maximum: 255 }
  validates :share_uuid, presence: true, uniqueness: true

  scope :public_lists, -> { where(is_public: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }

  before_validation :ensure_share_uuid, on: :create

  def to_param
    share_uuid
  end

  private

    def ensure_share_uuid
      self.share_uuid ||= SecureRandom.uuid
    end
end
