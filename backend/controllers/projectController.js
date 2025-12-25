import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import { emitToUser } from '../socket.js';

// @desc    Get all projects for authenticated user
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user._id.toString()) {
        res.json(project);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
    const { name, description, color, status, deadline } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please provide project name');
    }

    const project = await Project.create({
        user: req.user._id,
        name,
        description,
        color,
        status,
        deadline
    });

    emitToUser(req.user._id.toString(), 'projects_updated', { action: 'create', project: project });
    res.status(201).json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user._id.toString()) {
        project.name = req.body.name || project.name;
        project.description = req.body.description !== undefined ? req.body.description : project.description;
        project.color = req.body.color || project.color;
        project.status = req.body.status || project.status;
        project.deadline = req.body.deadline !== undefined ? req.body.deadline : project.deadline;

        const updatedProject = await project.save();
        emitToUser(req.user._id.toString(), 'projects_updated', { action: 'update', project: updatedProject });
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user._id.toString()) {
        await project.deleteOne();
        emitToUser(req.user._id.toString(), 'projects_updated', { action: 'delete', projectId: req.params.id });
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});
