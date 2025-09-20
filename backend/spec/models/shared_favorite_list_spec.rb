require "rails_helper"

RSpec.describe SharedFavoriteList, type: :model do
  let(:user) { create(:user) }
  let(:search_history) { create(:search_history, user:) }

  describe "associations" do
    it { is_expected.to belong_to(:user).required }
    it { is_expected.to belong_to(:search_history).required }
  end

  describe "validations" do
    subject { create(:shared_favorite_list, user:, search_history:) }

    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
    it { is_expected.to validate_uniqueness_of(:share_uuid).ignoring_case_sensitivity }

    describe "重複制御（同一ユーザー×同一検索履歴）" do
      it "公開リストが存在すると、同条件の公開リストは作成できない" do
        create(:shared_favorite_list, :public, user:, search_history:)
        dup = build(:shared_favorite_list, :public, user:, search_history:)

        expect(dup).to be_invalid
        expect(dup.errors[:search_history_id]).to be_present
      end

      it "公開リストが存在すると、同条件の非公開リストも作成できない" do
        create(:shared_favorite_list, :public, user:, search_history:)
        private_list = build(:shared_favorite_list, :private, user:, search_history:)

        expect(private_list).to be_invalid
        expect(private_list.errors[:search_history_id]).to be_present
      end

      it "ユーザーが異なれば同一検索履歴でも作成できる" do
        other_user = create(:user)
        create(:shared_favorite_list, :public, user:, search_history:)
        other_public = build(:shared_favorite_list, :public, user: other_user, search_history:)

        expect(other_public).to be_valid
      end
    end
  end

  describe "factory" do
    subject(:shared_list) { create(:shared_favorite_list, user:, search_history:) }

    it "有効なファクトリを持つこと" do
      expect(build(:shared_favorite_list)).to be_valid
    end

    it "user, search_history, title が正しく設定されること" do
      aggregate_failures do
        expect(shared_list.user).to eq(user)
        expect(shared_list.search_history).to eq(search_history)
        expect(shared_list.title).to be_present
      end
    end
  end

  describe "scopes" do
    let!(:public_list)  { create(:shared_favorite_list, :public,  user:) }
    let!(:private_list) { create(:shared_favorite_list, :private, user:) }
    let!(:_sentinel_other) { create(:shared_favorite_list) }

    describe ".owned_by" do
      it "ユーザー ID を渡すと、そのユーザーのリストだけ返す" do
        results = SharedFavoriteList.owned_by(user.id)
        expect(results).to contain_exactly(public_list, private_list)
      end

      it "User オブジェクトを渡すと、そのユーザーのリストだけ返す" do
        results = SharedFavoriteList.owned_by(user)
        expect(results).to contain_exactly(public_list, private_list)
      end
    end

    describe ".public_lists" do
      it "公開リストのみを返すこと" do
        results = SharedFavoriteList.public_lists
        expect(results).to include(public_list)
        expect(results).not_to include(private_list)
      end
    end
  end

  describe "#to_param" do
    subject(:shared_list) { create(:shared_favorite_list, user:, search_history:) }

    it "share_uuid を返すこと" do
      expect(shared_list.to_param).to eq(shared_list.share_uuid)
    end
  end

  describe "callbacks" do
    describe "share_uuid の自動生成" do
      it "作成時に share_uuid が自動生成されること（形式も正しい）" do
        shared_list = build(:shared_favorite_list, user:, search_history:, share_uuid: nil)

        expect { shared_list.save! }.to change { shared_list.share_uuid }.from(nil)
        expect(shared_list.share_uuid).to be_present
        expect(shared_list.share_uuid).to be_uuid
      end

      it "share_uuid がすでに設定されている場合は変更しないこと" do
        custom_uuid = SecureRandom.uuid
        shared_list = build(:shared_favorite_list, user:, search_history:, share_uuid: custom_uuid)

        shared_list.save!
        expect(shared_list.share_uuid).to eq(custom_uuid)
      end
    end
  end
end
