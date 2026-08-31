/**
 * meetingCircle.controller.js — Express controller handlers for Meeting Circles
 */

import * as circleService from './meetingCircle.service.js';
import { validateCircleCreate, validateParticipantReport } from './meetingCircle.validation.js';

export async function createCircle(req, res, next) {
  try {
    const validatedData = validateCircleCreate(req.body);
    const result = await circleService.createCircle(req.user, validatedData);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getDiscoverableCircles(req, res, next) {
  try {
    const circles = await circleService.getDiscoverableCircles(req.user);
    res.status(200).json({ success: true, data: circles });
  } catch (err) {
    next(err);
  }
}

export async function getMyCircles(req, res, next) {
  try {
    const circles = await circleService.getMyCircles(req.user);
    res.status(200).json({ success: true, data: circles });
  } catch (err) {
    next(err);
  }
}

export async function getCircleById(req, res, next) {
  try {
    const circle = await circleService.getCircleById(req.params.circleId, req.user);
    res.status(200).json({ success: true, data: circle });
  } catch (err) {
    next(err);
  }
}

export async function joinCircle(req, res, next) {
  try {
    const result = await circleService.joinCircle(req.params.circleId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function leaveCircle(req, res, next) {
  try {
    const result = await circleService.leaveCircle(req.params.circleId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteCircle(req, res, next) {
  try {
    const result = await circleService.deleteCircle(req.params.circleId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function reportParticipant(req, res, next) {
  try {
    const validatedData = validateParticipantReport(req.body);
    const result = await circleService.reportParticipant(
      req.params.circleId,
      req.user,
      validatedData
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getActiveParticipants(req, res, next) {
  try {
    const participants = await circleService.getActiveParticipants(req.params.circleId, req.user);
    res.status(200).json({ success: true, data: participants });
  } catch (err) {
    next(err);
  }
}
