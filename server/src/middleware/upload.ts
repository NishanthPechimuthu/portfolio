import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB) || 50;

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const BLOCKED_EXTS = [
  "php", "phtml", "exe", "sh", "bat", "py", "js", "cgi", "pl", "htaccess",
  "msi", "dll", "scr", "com", "cmd", "vbs", "vbe", "wsf", "wsh", "ps1",
  "psm1", "psd1", "jar", "apk", "deb", "rpm", "app", "dmg", "iso", "img",
  "bin", "run", "action", "command", "inf", "ins", "isu", "job", "lnk",
  "mst", "paf", "pif", "reg", "rgs", "sct", "shb", "shs", "u3p", "ws",
  "hta", "cpl", "msc", "msp", "gadget", "torrent", "crx", "xpi",
];

const ALLOWED_SHARE_MIMES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "text/plain", "text/csv", "text/markdown",
  "application/json",
  "application/zip", "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav",
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(UPLOAD_DIR, subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (BLOCKED_EXTS.includes(ext)) {
    cb(new Error("File type not allowed"));
  } else {
    cb(null, true);
  }
}

export const uploadImage = (subdir = "") =>
  multer({
    storage: buildStorage(subdir),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  });

export const uploadFile = (subdir = "") =>
  multer({
    storage: buildStorage(subdir),
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: fileFilter,
  });

export function getFileUrl(filename: string, subdir = ""): string {
  const base = process.env.UPLOAD_PUBLIC_URL || "http://localhost:3001/uploads";
  return subdir ? `${base}/${subdir}/${filename}` : `${base}/${filename}`;
}

function shareFileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (BLOCKED_EXTS.includes(ext)) {
    cb(new Error("File type not allowed"));
  } else if (!ALLOWED_SHARE_MIMES.includes(file.mimetype)) {
    cb(new Error("File type not allowed for sharing. Only documents, images, and media files are permitted."));
  } else {
    cb(null, true);
  }
}

export const uploadShareFile = (subdir = "") =>
  multer({
    storage: buildStorage(subdir),
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: shareFileFilter,
  });

