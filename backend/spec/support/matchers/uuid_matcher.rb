UUID_REGEX = /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/i

RSpec::Matchers.define :be_uuid do
  match {|actual| actual.to_s.match?(UUID_REGEX) }
  failure_message {|actual| "expected #{actual.inspect} to match UUID format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" }
  description { "match a generic UUID (any version)" }
end

UUID_V4_REGEX = /\A\h{8}-\h{4}-4\h{3}-[89abAB]\h{3}-\h{12}\z/

RSpec::Matchers.define :be_uuid_v4 do
  match {|actual| actual.to_s.match?(UUID_V4_REGEX) }
  failure_message {|actual| "expected #{actual.inspect} to match UUID v4 format" }
  description { "match a UUID v4" }
end
