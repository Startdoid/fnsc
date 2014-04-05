var Task = require('./models/task');

module.exports = function(app) {

	// api ---------------------------------------------------------------------
	// get all task
	app.get('/api/tasks', function(req, res) {

		// use mongoose to get all tasks in the database
		Task.find(function(err, tasks) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(tasks); // return all tasks in JSON format
		});
	});

	// create task and send back all tasks after creation
	app.post('/api/tasks', function(req, res) {
		// create a task, information comes from AJAX request from Angular
		Task.create({
			text : req.body.text,
			done : false
		}, function(err, task) {
			if (err)
				res.send(err);

			// get and return all the tasks after you create another
			Task.find(function(err, tasks) {
				if (err)
					res.send(err)
				res.json(tasks);
			});
		});
	});

	// delete a task
	app.delete('/api/tasks/:task_id', function(req, res) {
		Task.remove({
			_id : req.params.task_id
		}, function(err, task) {
			if (err)
				res.send(err);

			// get and return all the tasks after you create another
			Task.find(function(err, tasks) {
				if (err)
					res.send(err)
				res.json(tasks);
			});
		});
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};