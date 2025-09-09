require "rails_helper"

RSpec.describe UserAuth, type: :model do
  context "FactoryBot のデフォルト値のまま" do
    let(:user_auth) { create(:user_auth) }

    it "認証済みの user_auth レコードを正常に新規作成できること" do
      expect(user_auth).to be_valid
      expect(user_auth).to be_confirmed
    end
  end

  describe "バリデーション" do
    it "user が必須であること" do
      record = build(:user_auth, user: nil)
      expect(record).to be_invalid
      expect(record.errors[:user]).to be_present
    end
  end

  describe "DB 制約" do
    it "user_id を nil にできない（NOT NULL 制約が効く）" do
      record = create(:user_auth)

      sql = ActiveRecord::Base.send(
        :sanitize_sql_array,
        ["UPDATE user_auths SET user_id = NULL WHERE id = ?", record.id],
      )

      expect {
        ActiveRecord::Base.connection.exec_update(sql, "db_constraint_test")
      }.to raise_error(ActiveRecord::NotNullViolation)
    end
  end
end
