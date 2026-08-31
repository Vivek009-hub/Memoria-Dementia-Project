/**
 * meeting.controller.js — Controller request handlers for Meeting Circle
 */

import * as meetingService from './meeting.service.js';
import { validateObjectId, validateCreateMeeting } from './meeting.validation.js';

export async function createMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    validateCreateMeeting(req.body);
    const meeting = await meetingService.createMeetingForSession(sessionId, req.user, req.body);
    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
}

export async function getMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const meeting = await meetingService.getMeetingBySessionId(sessionId, req.user);
    res.status(200).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
}

export async function joinMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const result = await meetingService.joinMeeting(sessionId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function leaveMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const result = await meetingService.leaveMeeting(sessionId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function startMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const meeting = await meetingService.startMeeting(sessionId, req.user);
    res.status(200).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
}

export async function endMeeting(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const meeting = await meetingService.endMeeting(sessionId, req.user);
    res.status(200).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
}

export async function removeParticipant(req, res, next) {
  try {
    const { sessionId, participantId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    validateObjectId(participantId, 'participantId');
    const result = await meetingService.removeParticipant(sessionId, req.user, participantId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAttendance(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const attendance = await meetingService.getAttendanceHistory(sessionId, req.user);
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
}

export async function getPatientHistory(req, res, next) {
  try {
    const history = await meetingService.getPatientMeetingHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const { provider } = req.params;
    const result = await meetingService.handleWebhook(provider, req.body, req.headers);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
