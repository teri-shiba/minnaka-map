require "rails_helper"

RSpec.describe Operator, type: :model do
  describe "associations" do
    it { should have_many(:stations).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:alias_name) }
  end

  describe "factory" do
    it "有効なファクトリを持つこと" do
      expect(build(:operator)).to be_valid
    end
  end

  describe "callbacks" do
    context "alias_name が空の場合" do
      let!(:operator) { create(:operator, name: "テスト運営会社", alias_name: nil) }

      it "name の値が alias_name にコピーされること" do
        expect(operator.alias_name).to eq("テスト運営会社")
      end
    end

    context "alias_name が設定されている場合" do
      let!(:operator) { create(:operator, name: "テスト運営会社", alias_name: "テスト運営") }

      it "alias_name の値が保持されること" do
        expect(operator.alias_name).to eq("テスト運営")
      end
    end
  end

  describe "#display_name" do
    context "alias_name が存在する場合" do
      let!(:operator) { create(:operator, name: "テスト運営会社", alias_name: "テスト運営") }

      it "alias_name を返すこと" do
        expect(operator.display_name).to eq("テスト運営")
      end
    end

    context "alias_name が空の場合" do
      let!(:operator) { create(:operator, name: "テスト運営会社", alias_name: "") }

      it "name を返すこと" do
        expect(operator.display_name).to eq("テスト運営会社")
      end
    end
  end
end
