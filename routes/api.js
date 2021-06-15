'use strict';

const connectDB = require('../connection');
const projects = require('../models/projects.js');

connectDB();

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      async function getIssues() {
        try {
          let {project} = req.params;
          
          // Find and filter if existed
          let findProject = await projects.findOne({project: project}).exec(); 

          if (!findProject) {
            return res.json([]);
          } 

          let issues = findProject.issues.filter(function(i) {
            for (let key in req.query) {
              // Change req.query.open from string to boolean
              if (req.query[key] == 'true') {
                req.query[key] = true;
              } else if (req.query[key] == 'false') {
                req.query[key] = false;
              }
              
              if (i[key] != req.query[key]) {
                return false;
              }
            }
            return true;
          });

          return res.json(issues);
        } catch (error) {
          console.log('error: ' + error);
        }
      }

      getIssues();
    })
    
    .post(function (req, res) {
      async function postIssue() {
        try {
          let {project} = req.params;

          // New issue
          let issue = {};

          if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
            return res.json({error: 'required field(s) missing'});
          } else {
            await Object.assign(issue, req.body);
          }

          // Find project
          let findProject = await projects.findOne({project: project}).exec();
          let result = {};

          // Create new project if not existed
          if (!findProject) {
            result = await new projects({
              project: project
            });
          } else {
            result = findProject;
          }

          await result.issues.push(issue);
          let saveResult = await result.save();

          return res.json(saveResult.issues[saveResult.issues.length - 1]);
        } catch (error) {
          console.log('error: ' + error);
        }
      }

      postIssue();
    })
    
    .put(function (req, res){
      async function update() {
        try {
          let {project} = req.params;
          let {_id} = req.body;

          let updateFields = {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text,
            open: req.body.open
          };

          // Find project
          let findProject = await projects.findOne({project: project}).exec();
          let issue = {};
          let falsy = 0;

          if (!findProject) {
            return res.json({error: 'could not update', '_id': _id});
          }

          // Find subdocument
          if (_id) {
            issue = findProject.issues.id(_id);
          } else {
            return res.json({error: 'missing _id'});
          }

          // Increment falsy count if update field is empty/undefined
          for (let key in updateFields) {
            if (!updateFields[key]) {
              falsy = falsy + 1;
            }
          }

          // If all 6 fields are empty/undefined return error
          if (falsy == 6) {
            return res.json({error: 'no update field(s) sent', '_id': _id});
          }

          // Update issue
          if (issue) {
            for (let key in updateFields) {
              if (updateFields[key]) {
                issue[key] = updateFields[key];
              }
            }

            if (updateFields.open == 'false') {
              issue.open = false;
            }
          } else {
            return res.json({error: 'could not update', '_id': _id});
          }

          let save = await findProject.save();
          
          return res.json({result: 'successfully updated', '_id': _id});
        } catch (error) {
          console.log('error: ' + error);
        }
      }

      update();
    })
    
    .delete(function (req, res){
      async function deleteIssue() {
        try{
          let {project} = req.params;
          let {_id} = req.body;

          if (!_id) {
            return res.json({error: 'missing _id'});
          }

          // Find project
          let findProject = await projects.findOne({project: project}).exec();

          if (!project) {
            return res.json({error: 'could not delete', '_id': _id});
          }

          // Find issue
          let issue = findProject.issues.id(_id);

          if (!issue) {
            return res.json({error: 'could not delete', '_id': _id});
          }

          await issue.remove();
          let save = await findProject.save();

          return res.json({result: 'successfully deleted', '_id': _id});
        } catch (error) {
          console.log('error: ' + error);
        }
      }
      
      deleteIssue();
    });
    
};
