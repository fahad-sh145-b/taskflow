const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const authorizeRoles = require('../admin');
const { jwtAuthMiddleware } = require('../jwt');
const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/user');

// Apply JWT middleware to all project routes
router.use(jwtAuthMiddleware);

// GET ALL PROJECTS
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate("owner", "name email").sort({ createdAt: -1 });
        return res.status(200).json(projects);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// CREATE PROJECT (Only admin and manager)
router.post("/", authorizeRoles("admin", "manager"), async (req, res) => {
    try {
        const { name, description, owner } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const ownerId = (req.user && (req.user._id || req.user.id)) || owner;

        if (!ownerId) {
            return res.status(400).json({ message: "Project owner is required" });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description || "",
            owner: ownerId
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// UPDATE PROJECT (Admin can edit any project, Owner can edit their own)
router.put("/:id", async (req, res) => {
    try {
        const projectId = req.params.id;
        const currentUserId = (req.user._id || req.user.id).toString();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const userRole = currentUser?.role || req.user.role;

        const isOwner = project.owner && project.owner.toString() === currentUserId;
        const isAdmin = userRole === "admin";

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Access denied. Only an admin or the project owner can update this project."
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Project updated successfully",
            project: updatedProject
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// DELETE PROJECT (Admin can delete any project, Owner can delete their own)
router.delete("/:id", async (req, res) => {
    try {
        const projectId = req.params.id;
        const currentUserId = (req.user._id || req.user.id).toString();

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid Project ID format" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const userRole = currentUser?.role || req.user.role;

        const isOwner = project.owner && project.owner.toString() === currentUserId;
        const isAdmin = userRole === "admin";

        // Block regular members or users who don't own this project
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Access denied. Only an admin or the project owner can delete this project."
            });
        }

        await Project.findByIdAndDelete(projectId);

        // Delete all tasks associated with this project
        await Task.deleteMany({ project: projectId });

        return res.status(200).json({
            message: "Project and its tasks deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
