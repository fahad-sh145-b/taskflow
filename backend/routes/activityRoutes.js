const express = require("express");

const Activity = require("../models/activity");
const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");
const { jwtAuthMiddleware } = require('../jwt');

const router = express.Router();

router.get("/:taskId", jwtAuthMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);
    const userId = (req.user._id || req.user.id).toString();

    const currentUser = await User.findById(userId);
    const userRole = currentUser?.role || req.user.role;
    const isAdmin = userRole === "admin";

    const isProjectOwner =
      project &&
      project.owner.toString() === userId;

    const isCreator =
      task.createdBy.toString() === userId;

    const isAssignee =
      task.assignedTo &&
      task.assignedTo.toString() === userId;

    if (!isAdmin && !isProjectOwner && !isCreator && !isAssignee) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const activities = await Activity.find({
      task: task._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
