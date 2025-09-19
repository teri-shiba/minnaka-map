require "rails_helper"

RSpec.describe UserAuth, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user).required }
  end

  describe "factory" do
    let(:user_auth) { create(:user_auth) }

    it "有効かつ確認済みであること" do
      aggregate_failures do
        expect(user_auth).to be_valid
        expect(user_auth).to be_confirmed
      end
    end
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:user) }
  end

  describe "database constraints" do
    it "user_id を nil にできない（NOT NULL 制約）" do
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

  describe ".add_permitted_params" do
    it "Devise parameter sanitizer に追加する許可リスト (:nameのみ)を返すこと" do
      permitted = UserAuth.add_permitted_params
      expect(permitted).to contain_exactly(:name)
      expect(permitted).to all(be_a(Symbol))
    end
  end
end
