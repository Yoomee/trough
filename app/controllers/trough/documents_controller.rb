module Trough
  class DocumentsController < ::Trough::ApplicationController

    load_and_authorize_resource
    skip_load_resource only: [:show, :destroy, :info, :replace]

    before_action :prepare_new_document, only: [:index, :search]

    helper_method :sort_column, :sort_direction

    def index
      docs = Document.include_meta.all
      @documents = docs.order("LOWER(NULLIF(#{sort_column}, '')) #{sort_direction}")
    end

    def search
      @documents = Document.include_meta.search(params[:term]).order(:slug)
      render :index
    end

    def autocomplete
      render json: Document.search(params[:term]).pluck(:slug).to_json
    end

    def new
    end

    def create
      @new_document = true
      @document.uploader = current_user.full_name if current_user && current_user.full_name
      return unless !@document.save && @document.errors[:md5]
      @duplicate_document = Document.find_by(md5: @document.md5)
    end

    def destroy
      @document = Document.find_by(slug: params[:id])
      @d_id = @document.attributes['id']
      @document.destroy
      flash[:notice] = "Document deleted."
      redirect_to documents_path
    end

    def edit
    end

    def update
    end

    def replace
      @document = Document.find_by(slug: params[:id])
      file_filename = @document.file_filename
      file_params = JSON.parse(document_params[:file])
      if @document.update(document_params)
        flash[:notice] = "#{@document.file_filename} replaced"
        @document.update_attribute(:file_filename, file_filename)
      elsif @document.errors[:md5]
        @duplicate_document = Document.find_by(md5: @document.md5)
      end
    end

    def info
      @document = Document.find_by(slug: params[:id])
      render json: @document, include: { document_usages: { include: { content_package: { only: [:name] } } } }, methods: :uploaded_on
    end

    def show
      uri = URI(request.referer || "")
      @document = Document.find_by(slug: params[:id])
      if GemHelper.gem_loaded?(:pig)
        permalink = ::Pig::Permalink.find_from_url(uri.path)
        if permalink
          usage = DocumentUsage.where(document:@document, pig_content_package_id: permalink.resource_id).first
          usage.update_attribute(:download_count, usage.download_count + 1) if usage
        end
      end
      if @document
        redirect_to @document.s3_url
      else
        redirect_to pig.not_found_url
      end
    end

    def modal
      @documents = Document.all
      @document = Document.new
      render :layout => false
    end

    def replace_modal
      @document = Document.find(params[:id])
      render :layout => false
    end

    def modal_create
      @document = Document.new(document_params)
      if !@document.save && @document.errors[:md5]
        @duplicate_document = Document.find_by(md5: @document.md5)
      end
      @document = Document.include_meta.find(@document.id)
    end

    private

    def document_params
      params.require(:document).permit(:file, :slug, :description)
    end

    def prepare_new_document
      @document = Document.new
    end

    def sort_column
      Document.column_names.include?(params[:sort]) ? params[:sort] : 'slug'
    end

    def sort_direction
      %w(asc desc).include?(params[:direction]) ? params[:direction] : 'asc'
    end
  end
end
