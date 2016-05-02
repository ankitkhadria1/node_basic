var async = require('async');
var sendResponse = require('./sendResponse.js');
var constant = require('./constant.js');
var connection = require('./db.js');


exports.getData = function(userId, res) {


    async.auto({
        getPost: function(callback) {
            q = ' select * from post ';
            connection.query(q, function(err, result) {
                if (err)
                    callback(err);
                else
                    callback(null, result);

            });

        }
    }, function(err, result) {
        if (err) {
            console.log('er---', err);
        } else {

            res.render('profile.ejs', {
                result: result,
                userId: userId,
                length: result['getPost'].length
            });
        }
    });

}

exports.addPost = function(req, res) {
    var postText = req.body.post_text;
    var userId = req.body.userId;

    q = ' insert into post(post_text , created_by) values(?,?) ';

    connection.query(q, [postText, userId], function(err, result) {
        if (err)
            sendResponse.somethingWentWrongError(err);
        else {
            res.write("done!!");
            res.end();
        }

    })

}

exports.addComment =  function(req,res)
{
	var likes = req.body.like;
	var userId = req.body.userId;
	var comment  = req.body.comment;

	q = ' insert into comment(comment,likes,user_id) values(?,?,?) ';
	connection.query(q,[comment,like,userId],function(err,result)
	{
		if(err)
			sendResponse.somethingWentWrongError(err);
		else
		{
			res.write(!!done);
			res.end();
		}
	})
}