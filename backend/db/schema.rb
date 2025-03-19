# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_03_18_060800) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "search_histories", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_search_histories_on_user_id"
  end

  create_table "search_history_center_stations", force: :cascade do |t|
    t.bigint "search_history_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "station_id", null: false
    t.index ["search_history_id"], name: "index_search_history_center_stations_on_search_history_id"
    t.index ["station_id"], name: "index_search_history_center_stations_on_station_id"
  end

  create_table "search_history_start_stations", force: :cascade do |t|
    t.bigint "search_history_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "station_id", null: false
    t.index ["search_history_id"], name: "index_search_history_start_stations_on_search_history_id"
    t.index ["station_id"], name: "index_search_history_start_stations_on_station_id"
  end

  create_table "stations", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "latitude", precision: 10, scale: 5, null: false
    t.decimal "longitude", precision: 10, scale: 5, null: false
  end

  create_table "user_auths", force: :cascade do |t|
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.boolean "allow_password_change", default: false
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "email"
    t.json "tokens"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["confirmation_token"], name: "index_user_auths_on_confirmation_token", unique: true
    t.index ["email"], name: "index_user_auths_on_email", unique: true
    t.index ["reset_password_token"], name: "index_user_auths_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_user_auths_on_uid_and_provider", unique: true
    t.index ["user_id"], name: "index_user_auths_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "search_histories", "users"
  add_foreign_key "search_history_center_stations", "search_histories"
  add_foreign_key "search_history_center_stations", "stations"
  add_foreign_key "search_history_start_stations", "search_histories"
  add_foreign_key "search_history_start_stations", "stations"
  add_foreign_key "user_auths", "users"
end
