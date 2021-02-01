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
      let returnedFields = 'project_name assigned_to status_text _id issue_title issue_text created_by created_on updated_on open'
      let filteredFields = {'project_name': project}
      let allIssues;

      if(Object.keys(req.query).length >= 1) {
        filteredFields = {'project_name': project, ...req.query}
        allIssues = await Issue.find(filteredFields, returnedFields)
      } else {
        allIssues = await Issue.find(filteredFields, returnedFields);
      }

      res.json(allIssues);
    })
    
    .post(async (req, res) => {
      let project = req.params.project;
      let requiredFields = Object.keys(req.body).includes('issue_title') && Object.keys(req.body).includes('issue_text') && Object.keys(req.body).includes('created_by')
      
      console.log(req.body);

      if(requiredFields) {
        let issue = new Issue({
          project_name: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        })

        issue.save((err, data) => {
          res.json(data);
        })
      } else {
        res.json({ error: 'required field(s) missing' });
      }
    })
    
    .put(async (req, res) => {
      let project = req.params.project;
      let updatedFields = {}
      let issueID = req.body['_id'];
      let filteredFields = {'project_name': project, _id: issueID};

      if(!req.body['_id']) {
        res.json({ error: 'missing _id' })
      }

      Object.keys(req.body).forEach((key) => {
        if(key !== '_id' && req.body[key] !== '') {
          updatedFields[key] = req.body[key];
        }
      })

      if(Object.keys(updatedFields).length === 0) {

        res.json({ error: 'no update field(s) sent', '_id': issueID })

      } else if (Object.keys(updatedFields).length >= 1) {
        let issue = await Issue.findOneAndUpdate(filteredFields, {...updatedFields, 
          updated_on: new Date()}, 
          {new: true}); 

        if(issue === null) {
          res.json({ error: 'could not update', '_id': issueID })
        }
  
        res.json({result: 'successfully updated', '_id': issueID});
      }
    })
    
    .delete(async (req, res) => {
      let project = req.params.project;
      let issueID = req.body['_id'];
      let filteredFields = {'project_name': project, _id: issueID}

      if(!req.body['_id']) {
        res.json({ error: 'missing _id' })
      }

      let issue = await Issue.findOneAndDelete(filteredFields);

      if(issue === null) {
        res.json({ error: 'could not delete', '_id': issueID });
      } else {
        res.json({result: 'successfully deleted', '_id': issueID});
      }
    });
    
};
