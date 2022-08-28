var DocumentInfoModal = (function () {
  "use strict";

  $(document).ready(function(){
    $('body').on('click', '[data-document-info-modal]', function (event) {
      event.preventDefault();
      var openingLink = $(event.currentTarget);
      show(openingLink.data('document-info-modal'));
    });

    $('body').on('click', '[data-replace-document]', function (event) {
      event.preventDefault();
      var openingLink = $(event.currentTarget);
      showReplaceDocumentModal(openingLink.data('replace-document'));
    });
  });

  function show(slug) {
    $.get('/documents/' + slug + '/info', function(data) {
      var canDelete = !(_.any(data.document_usages, "active"));
      var delete_button = "";
      if(canDelete) {
        delete_button = "<a class='btn btn-error pull-right' href=\"/documents/<%= data.slug %>\" data-method='delete' href=''><i class='fa fa-trash-o'></i> Delete</a>";
      }
      else {
        delete_button = "<strong>The document can't be deleted until all active usages have been removed</strong>";
      }

      var compiled = _.template(
        "<div class='row'>" +
          "<div class='col-md-6'>" +
            "<label class='col-primary'>Filename</label>" +
            "<p><i><%= data.file_filename %></i></p>" +
          "</div>" +
          "<div class='col-md-6'>" +
            "<label class='col-primary'>Filesize / ID</label>" +
            "<p><i><%= data.file_size %> / <%= data.id%></i></p>" +
          "</div>" +
        "</div>" +
        "<div class='row'>" +
          "<div class='col-md-6'>" +
            "<label class='col-primary'>Author</label>" +
            "<p><i><%= data.uploader %></i></p>" +
          "</div>" +
          "<div class='col-md-6'>" +
            "<label class='col-primary'>Uploaded</label>" +
            "<p><i><%= data.uploaded_on %></i></p>" +
          "</div>" +
        "</div>" +
        "<label class='col-primary'>description</label>" +
        "<div class='document-description'> <%= data.description %> </div>" +
        "<div class='row'>" +
        "<div class='col-sm-12'>" +
        "<label class='col-primary'>Share URL</label>" +
        "<p><input disabled value='<%= data.share_url %>'/></p>" +
        "</div>" +
        "</div>" +
        "<table id='usage_link_list' class='cms-table'>" +
        "<thead>" +
          "<tr>" +
            "<th>Pages</th>" +
            "<th>Active</th>" +
            "<th>Download count</th>" +
          "</tr>" +
        "</thead>" +
        "<% _.each(data.document_usages, function(usage) {  %>" +
          "<tr>" +
          "<td><%= usage.unscoped_content_package.name %></td>" +
          "<td><%= usage.active %></td>" +
          "<td><%= usage.download_count %></td>" +
          "</tr>" +
        "<% }); %>" +
        "</table>" +
        delete_button +
        "<button class='btn pull-left' data-replace-document='<%= data.id %>'><i class='fa fa-exchange'></i> Replace </button>" +
        "<a class='btn btn-primary pull-right' href=\"/documents/<%= data.slug %>\" ><i class='fa fa-download'></i> Download</a>" +
        "<div class='clearfix'></div>",
        {variable: 'data'});
      $('#usageLinks .modal-body').html(compiled(data));
    });

    $('#usageLinks').modal("show");
  }

  function showReplaceDocumentModal(id) {
    $('#usageLinks').modal("hide");
    DocumentReplaceModal.show(id);
  }

  return {
    show: show
  };

})();
