require "trough/engine"
require 'trough/config'

module Trough

  class << self
    attr_writer :configuration
  end

  module_function

  def configuration
    @configuration ||= Config.new
  end

  def setup
    yield(configuration)
  end

end
