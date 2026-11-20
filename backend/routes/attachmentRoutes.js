const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Attachment = require("../models/attachment");
const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");
const { jwtAuthMiddleware } = require('../jwt');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'application/json',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow', // .ppsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/zip',
    'application/x-zip-compressed'
];

const allowedExtensions = [
    '.pdf',
    '.png', '.jpg', '.jpeg', '.webp', '.gif',
    '.json', '.txt', '.csv',
    '.doc', '.docx',
    '.ppt', '.pptx', '.pps', '.ppsx',
    '.xls', '.xlsx',
    '.zip'
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${require("crypto").randomUUID()}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB (generous for presentation decks)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
        const isExtAllowed = allowedExtensions.includes(ext);

        if (isMimeAllowed || isExtAllowed) {
            return cb(null, true);
        }

        cb(
            new Error("Unsupported file format. Allowed formats: PPT, PPTX, PDF, PNG, JPG, DOCX, XLSX, JSON, TXT, CSV, ZIP")
        );
    },
});

// Middleware to gracefully handle multer errors as JSON (400) instead of 500 HTML
const handleFileUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: `File upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                message: err.message
            });
        }
        next();
    });
};

// Task access validation
async function canAccessTask(task, userId, role) {
    const uId = (userId || "").toString();
    const currentUser = await User.findById(uId);
    if ((currentUser?.role || role) === "admin") return true;

    const project = await Project.findById(task.project);
    if (!project) return false;

    return (
        project.owner.toString() === uId ||
        task.createdBy.toString() === uId ||
        (task.assignedTo && task.assignedTo.toString() === uId)
    );
}

// UPLOAD ATTACHMENT
router.post(
    "/:taskId",
    jwtAuthMiddleware,
    handleFileUpload,
    async (req, res) => {
        try {
            const task = await Task.findById(req.params.taskId);

            if (!task) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    message: "Task not found",
                });
            }

            const userId = req.user._id || req.user.id;
            const allowed = await canAccessTask(task, userId, req.user.role);

            if (!allowed) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a file",
                });
            }

            const attachment = await Attachment.create({
                originalName: req.file.originalname,
                filename: req.file.filename,
                mimeType: req.file.mimetype,
                size: req.file.size,
                task: task._id,
                uploadedBy: userId,
            });

            res.status(201).json({
                message: "File uploaded successfully",
                attachment,
            });
        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                message: error.message,
            });
        }
    }
);

// GET ATTACHMENTS
router.get("/:taskId", jwtAuthMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const userId = req.user._id || req.user.id;
        const allowed = await canAccessTask(task, userId, req.user.role);

        if (!allowed) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        const attachments = await Attachment.find({
            task: task._id,
        })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(attachments);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// DOWNLOAD ATTACHMENT
router.get("/download/:attachmentId", jwtAuthMiddleware, async (req, res) => {
    try {
        const attachment = await Attachment.findById(
            req.params.attachmentId
        );

        if (!attachment) {
            return res.status(404).json({
                message: "Attachment not found",
            });
        }

        const task = await Task.findById(attachment.task);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const userId = req.user._id || req.user.id;
        const allowed = await canAccessTask(task, userId, req.user.role);

        if (!allowed) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        const filePath = path.join(uploadDir, attachment.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "File not found on server",
            });
        }

        res.download(filePath, attachment.originalName);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// DELETE ATTACHMENT
router.delete("/:attachmentId", jwtAuthMiddleware, async (req, res) => {
    try {
        const attachment = await Attachment.findById(
            req.params.attachmentId
        );

        if (!attachment) {
            return res.status(404).json({
                message: "Attachment not found",
            });
        }

        const task = await Task.findById(attachment.task);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);
        const userId = (req.user._id || req.user.id).toString();

        const currentUser = await User.findById(userId);
        const isAdmin = (currentUser?.role || req.user.role) === "admin";

        const isProjectOwner =
            project &&
            project.owner.toString() === userId;

        const isUploader =
            attachment.uploadedBy.toString() === userId;

        if (!isAdmin && !isProjectOwner && !isUploader) {
            return res.status(403).json({
                message: "You cannot delete this attachment",
            });
        }

        const filePath = path.join(uploadDir, attachment.filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await attachment.deleteOne();

        res.json({
            message: "Attachment deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
