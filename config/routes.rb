Trough::Engine.routes.draw do
  mount Refile.app, at: Refile.mount_point, as: :refile_app
  scope "/#{Trough.configuration.mount_path}" do
    resources :documents, path: "/", :except => :show do
      collection do
        get 'modal'
        get 'replace_modal'
        post 'modal_create'
        get 'search'
        get 'autocomplete'
      end
      member do
        get 'info', :constraints => { :id => /.*/ }
        patch 'replace', :constraints => { :id => /.*/ }
      end
      get 'links' => 'document_usages#links'
      get 'stats' => 'document_usages#stats'
    end

    get '/*id', to: 'documents#show', format: false
  end
end
