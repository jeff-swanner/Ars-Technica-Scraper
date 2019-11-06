$(document).ready(function(){
    // On click event for when articles save button is clicked
    $('.container').on('click','.saveButton',function(){
        let that = $(this);
        // Post request for saving article to database using id saved in button
        $.post("./saveArticle",
        {
          id: $(this).attr('data-id')
        },
        function(data, status){
            // Updates button on success
            that.text('Saved');
            that.removeClass('btn-primary');
            that.addClass('btn-warning disabled');
        });
    });

    // On click event for unsaving articles from database
    $('.container').on('click','.unsaveButton',function(){
        // Grabs id from button
        var id = $(this).attr('data-card');

        // Post request to remove article from database
        $.post('./deletearticle/'+$(this).attr('data-id'),function(data){
            $('.'+id).remove();
        });
    });

    // Button to display notes when clicked
    $('.container').on('click','.noteButton',function(){
        // grabs card class from data attribute
        var cardClass = $(this).attr('data-card');

        // Changes the display when clicked
        if($('.'+cardClass).attr('class')===('col-lg-8 '+cardClass)){
            $(this).text('View Comments')
            $('.'+cardClass).attr('class','col-lg-4 '+cardClass);
            $('.col-lg-4').show();
            $('.'+cardClass)[0].scrollIntoView(true);
        } else {
            $('.'+cardClass).attr('class','col-lg-8 '+cardClass);
            $('.col-lg-4').hide();
            $(this).text('Back to Articles')
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        }
    });

    // Button for scraping Ars Technica for new articles
    $('body').on('click','#scrape',function(){
        $.get('./scrape',function(data){
            // Regenerates the articles on scrape
            location.reload();
        })
    });

    // Button for posting comments to database
    $('.container').on('click','.postComment',function(){
        // Grabs comment from form input
        var comment = $('#'+$(this).attr('data-id')).val();

        // Clears form input
        $('#'+$(this).attr('data-id')).val("");

        // saves the footer id to display the comment
        var footer ='#'+$(this).attr('data-footer');

        // Post request to save comment in database
        $.post("./articles/"+$(this).attr('data-articleid'),
        {
          body: comment
        },
        function(data, status){
            // Get request to get timestamp info on comment
            $.getJSON('./timestamp/'+data._id,function(time){
                var timeStamp = time;

                // Creates the comment html
                var comment = `
                <div class='card card-body'id='${data._id}'>
                    <div class="float-right">
                        <button type="button" class="deleteComment close" data-id="${data._id}">
                            &times;
                        </button>
                    </div>
                    <div class='d-inline'>${data.username}</div>
                    <div class='text-secondary d-inline'>${timeStamp}</div>
                    <p>${data.body}</p>
                    
                </div>`;

                // Appends the comment to footer
                $(footer).append(comment);
            })
        });
    });

    // Onclick event for deleting comments
    $('.container').on('click','.deleteComment',function(){
        // Grabs comment id from button
        var id = $(this).attr('data-id');
        // Get request to delete comment
        $.getJSON('./deletecomment/'+$(this).attr('data-id'),function(data){
            $('#'+id).remove();
        });
    });
});