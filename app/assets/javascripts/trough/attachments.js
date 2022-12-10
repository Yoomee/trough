var attachments = (function () {

    $(document).on("upload:start", "form#new_document, form#replace_document", function(event) {
      var $progress = $('.progress', event.currentTarget);
      var $progressBar = $('.progress-bar', $progress);
      $("#document_description_label").slideDown();
      $("#document_description_input").slideDown();
      $progressBar.css("width", '10%');
    });
  
    $(document).on("upload:progress", "form#new_document, form#replace_document", function(event) {
      var progress = event.originalEvent.detail.progress;
      var percentage = Math.round( (progress.loaded / progress.total) * 100);
      $('.progress-bar', event.currentTarget).css('width', percentage+'%');
    });
  
    $(document).on("upload:complete", "form#new_document, form#replace_document", function(event) {
      $form = $(event.currentTarget);
      $('#document_submit_action', $form).removeAttr('disabled');
    });
  
    // Rails_ujs fires this event and submits the form normally if a remote form has a file chosen.
    // This is because by default rails cant upload files via ajax, in our case the file is uploaded directly to S3
    // and so this is'nt an issue.
    $(document).on('ajax:aborted:file', 'form', function(){
     var form = $(this);
  
     // Manually trigger the rails ajax form submit
     $.rails.handleRemote(form);
     return false;
   });
  
   $(document).ready(function() {

      $(document).on("change", "input#document_file", function(event) {
             console.log("CHANGED");
             $("#document_description_label").slideDown();
             $("#document_description_input").slideDown();
             $('#document_submit_action').prop('disabled', false);
       });

     $(document).on("click", "#document_submit_action", function(event, xhr, status, error) {
       if($('#document_description_input').val() === '') {
         $('#error-message').addClass('error');
         $('#error-message').append("<span class='help-block'>description can't be blank</span>");
         $('#document_submit_action').removeClass('disabled').val("Upload file");
         return false;
       } else {
        $('#error-message').empty();
        $('.progress-bar').css("width", '80%');
        $('.progress-bar').show();
       }
     });
   });
  
  })();