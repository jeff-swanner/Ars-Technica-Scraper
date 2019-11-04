$(document).ready(function(){
    $('.container').on('click','.saveButton',function(){
        $(this).text('Saved');
        $(this).removeClass('btn-primary');
        $(this).addClass('btn-warning disabled');

        $.post("./saveArticle",
        {
          id: $(this).attr('data-id')
        },
        function(data, status){

        });
    });

    $('.container').on('click','.unsaveButton',function(){
        var id = $(this).attr('data-card');
        $.post('./deletearticle/'+$(this).attr('data-id'),function(data){
            $('.'+id).remove();
        });
    });

    $('.container').on('click','.noteButton',function(){
        var cardClass = $(this).attr('data-card');
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
    $('body').on('click','#scrape',function(){
        $.getJSON('./scrape',function(data){
            getArticles();

        })
    });
    $('.container').on('click','.postComment',function(){
        var comment = $('#'+$(this).attr('data-id')).val();
        $('#'+$(this).attr('data-id')).val("");
        var footer ='#'+$(this).attr('data-footer');
        console.log(footer)
        $.post("./articles/"+$(this).attr('data-articleid'),
        {
          body: comment
        },
        function(data, status){
            console.log(data);
            $.getJSON('./timestamp/'+data._id,function(time){
                var timeStamp = time;
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
                $(footer).append(comment);
            })
        });
    });

    $('.container').on('click','.deleteComment',function(){
        var id = $(this).attr('data-id');
        $.getJSON('./deletecomment/'+$(this).attr('data-id'),function(data){
            $('#'+id).remove();
        });

    })
    function getArticles() {
        $.getJSON('./currentArticles',function(data){
            $('#articles').empty();
            data.forEach(function(article, i){
                

                var card = $('<div>').addClass('card text-black border-info bg-light mb-3 article'+article._id);
                var body = $('<div>').addClass('card-body');
                var image = $('<img>').attr('src',article.image);
                image.addClass('img-fluid mb-2');
                image.attr('style','width: 100%;')
                var title = $('<h5>').addClass('card-header').text(article.title);
                var link = $('<a>').attr('href',article.link).append(title);
                link.addClass('text-dark')
    
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
                newComment.html(`<label for="exampleFormControlTextarea1">Share your thoughts</label>
                <textarea class="form-control" id='comment`+i+`' rows="3"></textarea>
                <button class="btn btn-primary mt-3 postComment" data-footer='footer${i}' data-articleid='`+article._id+`' data-id='comment`+i+`'>Post</button>`)
    
                comments.append(newComment);
    
                body.append(image, excerpt, saveButton, noteButton);
                card.append(link, body, comments);
    
                var column = $('<div>').addClass('col-lg-4 articleCard'+i);
                column.append(card)
                $('#articles').append(column);
            })
        });
    };
    
   getArticles();

});