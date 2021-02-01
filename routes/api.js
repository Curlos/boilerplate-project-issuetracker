'use strict';

const mongoose = require("mongoose");
const url = process.env.DB;
const Issue = require('../Models/Issue')

mongoose
	.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
    });

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      let project = req.params.project;
      const allIssues = await Issue.find({})
      res.json(allIssues);
      
    })
    
    .post(async (req, res) => {
      let project = req.params.project;
      let requiredFields = Object.keys(req.body).includes('issue_title') && Object.keys(req.body).includes('issue_text') && Object.keys(req.body).includes('created_by')
      
      if(requiredFields) {
        let issue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        })

        issue.save((err, data) => {
          res.json(data);
        })
      }
      
    })
    
    .put(async (req, res) => {
      let project = req.params.project;
      console.log(req.body);
    })
    
    .delete(async (req, res) => {
      let project = req.params.project;
      
    });
    
};
