'use strict'

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String, default: ''},
  status_text: {type: String, default: ''},
  open: {type: Boolean, default: true}
},
{
  timestamps: {createdAt: 'created_on', updatedAt: 'updated_on'}
});

const projectSchema = new Schema({
  project: {type: String, required: true, unique: true},
  issues: [issueSchema]
});

const projects = mongoose.model('projects', projectSchema);

module.exports = projects