$(document).ready(function(){
    $.getJSON('./scrape',function(data){
        console.log(data);
        data.forEach(function(article){
            var card = $('<div>').addClass('card text-black border-info bg-light mb-3');
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
            saveButton.addClass("btn btn-primary mr-3 mb-3");

            var noteButton = $('<button>').text('View Comments');
            noteButton.addClass("btn btn-secondary mr-3 mb-3");
            noteButton.attr('data-toggle','collapse');
            noteButton.attr('data-target','#collapseExample');

            var comments = $('<div>');
            comments.addClass('collapse card-footer');
            comments.attr('id','collapseExample');

            var comment = `
                <div class='card card-body'>
                    <div class='d-inline'>Duvanchi</div>
                    <div class='text-secondary d-inline'>3 hrs ago</div>
                    <p>this is crazyasdflkasjdf</p>
                </div>`;

            var newComment = $('<div>').addClass('form-group mt-2');
            newComment.html(`<label for="exampleFormControlTextarea1">Share your thoughts</label>
            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            <button class="btn btn-primary mt-3">Post</button>`)

            comments.append(comment,comment,newComment);

            body.append(image, excerpt, saveButton, noteButton);
            card.append(link, body, comments);

            var column = $('<div>').addClass('col-lg-4');
            column.append(card)
            $('#articles').append(column);
        })
    });
});