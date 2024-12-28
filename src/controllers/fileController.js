const fs = require('fs');
const path = require('path');
const db = require('../config/db');

exports.uploadFile = async (req, res) => {
  const { originalname, mimetype, size, path: filePath } = req.file;
  try {
    await db.execute(
      'INSERT INTO files (name, extension, mimetype, size, upload_date, path) VALUES (?, ?, ?, ?, NOW(), ?)',
      [originalname, path.extname(originalname), mimetype, size, filePath]
    );
    res.send('File uploaded successfully');
  } catch (error) {
    res.status(500).send('Error uploading file');
  }
};

exports.getFiles = async(req, res) => {
  const listSize = parseInt(req.query.list_size, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * listSize;

  try {
    const [files] = await db.execute('SELECT * FROM files LIMIT ? OFFSET ?', [listSize, offset]);
    res.json(files);
  } catch (error) {
    res.status(500).send('Error fetching files');
  }
}

exports.deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).send('File not found');

    const filePath = rows[0].path;
    await db.execute('DELETE FROM files WHERE id = ?', [id]);
    fs.unlinkSync(filePath);

    res.send('File deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting file');
  }
}

exports.getFile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).send('File not found');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).send('Error fetching file information');
  }
}

exports.downloadFile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).send('File not found');

    res.download(rows[0].path);
  } catch (error) {
    res.status(500).send('Error downloading file');
  }
}

exports.updateFile = async (req, res) => {
  const { id } = req.params;
  const { originalname, mimetype, size, path: filePath } = req.file;
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).send('File not found');

    fs.unlinkSync(rows[0].path);
    await db.execute(
      'UPDATE files SET name = ?, extension = ?, mimetype = ?, size = ?, upload_date = NOW(), path = ? WHERE id = ?',
      [originalname, path.extname(originalname), mimetype, size, filePath, id]
    );

    res.send('File updated successfully');
  } catch (error) {
    res.status(500).send('Error updating file');
  }
}
