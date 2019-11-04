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
            getArticles();
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

    // Function that gets all articles from database
    function getArticles() {
        $.getJSON('./currentArticles',function(data){
            // Empties out articles div
            $('#articles').empty();
            // Loops through all returned articles
            data.forEach(function(article, i){

                // Creates html and appends to aricles div
                var card = $('<div>').addClass('card text-black border-info bg-light mb-3 article'+article._id);
                var body = $('<div>').addClass('card-body');
                var image = $('<img>').attr('src',article.image);
                image.addClass('img-fluid mb-2');
                image.attr('style','width: 100%;')
                var title = $('<h5>').addClass('card-header').text(article.title);
                var link = $('<a>').attr('href',article.link).append(title);
                link.addClass('text-danger')
    
                var button = $('<a>').text('View Article');
                button.attr('role','button');
                button.addClass('btn btn-danger mr-3 mb-3');
                button.attr('href',article.link);
    
                var excerpt = $('<p>').text(article.excerpt);
                var saveButton = $('<button>').text('Save Article');
                saveButton.addClass("btn btn-primary mr-3 mb-3 saveButton");
                saveButton.attr('data-id',article._id)
    
                var noteButton = $('<button>').text('View Comments');
                noteButton.addClass("btn btn-secondary mr-3 mb-3 noteButton");
                noteButton.attr('data-toggle','collapse');
                var dataTarget = '#footer'+i;
                noteButton.attr('data-target',dataTarget);
                noteButton.attr('data-card','articleCard'+i);
    
                var comments = $('<div>');
                comments.addClass('collapse card-footer');
                comments.attr('id','footer'+i);
    
                if(article.comment.length > 0){
                    article.comment.forEach(function(com){
                        var timeStamp;
                        $.getJSON('./timestamp/'+com._id,function(time){
                            timeStamp = time;
                            var comment = `
                            <div class='card card-body'id='${com._id}'>
                                <div class="float-right">
                                    <button type="button" class="deleteComment close" data-id="${com._id}">
                                        &times;
                                    </button>
                                </div>
                                <div class='d-inline'>${com.username}</div>
                                <div class='text-secondary d-inline'>${timeStamp}</div>
                                <p>${com.body}</p>
                            </div>`;
                            comments.append(comment);
                        })
                        
                    });
                };

                var newComment = $('<div>').addClass('form-group mt-2');
                newComment.html(
                    `<label for="exampleFormControlTextarea1">Share your thoughts</label>
                    <textarea class="form-control" id='comment${i}' rows="3"></textarea>
                    <button class="btn btn-primary mt-3 postComment" data-footer='footer${i}' data-articleid='${article._id}' data-id='comment${i}'>Post</button>`
                )
    
                comments.append(newComment);
    
                body.append(image, excerpt, saveButton, noteButton);
                card.append(link, body, comments);
    
                var column = $('<div>').addClass('col-lg-4 articleCard'+i);
                column.append(card)
                $('#articles').append(column);
            });
        });
    };
    
    // Loads articles on initial page load
    getArticles();

});