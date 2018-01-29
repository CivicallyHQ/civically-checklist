# name: civically-checklist
# about: Adds a checklist system for users
# version: 0.1
# authors: angus
# url: https://github.com/civicallyhq/civically-checklist

register_asset 'stylesheets/civically-checklist.scss'

after_initialize do
  module ::CivicallyChecklist
    class Engine < ::Rails::Engine
      engine_name "civically_checklist"
      isolate_namespace CivicallyChecklist
    end
  end

  CivicallyChecklist::Engine.routes.draw do
    get ":username" => "checklist#list"
    post ":username/:item_id/toggle_checked" => "checklist#toggle_checked"
  end

  Discourse::Application.routes.append do
    mount ::CivicallyChecklist::Engine, at: "checklist"
  end

  load File.expand_path('../controllers/checklist.rb', __FILE__)
  load File.expand_path('../jobs/bulk_checklist_update.rb', __FILE__)
  load File.expand_path('../lib/checklist.rb', __FILE__)
end
