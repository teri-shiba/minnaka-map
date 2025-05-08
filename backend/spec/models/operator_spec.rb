require "rails_helper"

RSpec.describe Operator, type: :model do
  describe "ファクトリ" do
    it "有効なファクトリを持つこと" do
      expect(build(:operator)).to be_valid
    end
  end

  describe "関連付け" do
    it { should have_many(:stations).dependent(:destroy) }
  end

  describe "バリデーション" do
    it { should validate_presence_of(:name) }
    # it { should validate_uniqueness_of(:name) }
    it { should validate_presence_of(:alias_name) }
  end

  describe "コールバック" do
    context "alias_name が空の場合" do
      it "name の値が alias_name にコピーされること" do
        operator = create(:operator, name: "テスト運営会社", alias_name: nil)
        expect(operator.alias_name).to eq("テスト運営会社")
      end
    end

    context "alias_name が設定されている場合" do
      it "alias_name の値が保持されること" do
        operator = create(:operator, name: "テスト運営会社", alias_name: "テスト運営")
        expect(operator.alias_name).to eq("テスト運営")
      end
    end
  end

  describe "#display_name" do
    context "alias_name が存在する場合" do
      it "alias_name を返すこと" do
        operator = create(:operator, name: "テスト運営会社", alias_name: "テスト運営")
        expect(operator.alias_name).to eq("テスト運営")
      end
    end

    context "alias_name が空の場合" do
      it "name を返すこと" do
        operator = create(:operator, name: "テスト運営会社", alias_name: "")
        expect(operator.alias_name).to eq("テスト運営会社")
      end
    end
  end
end