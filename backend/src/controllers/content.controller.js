const Content = require('../models/content.model');

exports.getContents = async (req, res, next) => {
  try {
    const contents = await Content.find().sort('-createdAt');
    res.status(200).json({ success: true, count: contents.length, data: contents });
  } catch (error) {
    next(error);
  }
};

exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

exports.createContent = async (req, res, next) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
