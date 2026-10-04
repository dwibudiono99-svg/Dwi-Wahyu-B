import { RTProfile, Citizen, Meeting } from '../types/meeting';
import { defaultRTProfile, defaultCitizens, defaultMeetings } from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'rt_rapat_profile_v1',
  CITIZENS: 'rt_rapat_citizens_v1',
  MEETINGS: 'rt_rapat_meetings_v1',
};

export const loadRTProfile = (): RTProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading RT profile:', e);
  }
  return defaultRTProfile;
};

export const saveRTProfile = (profile: RTProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving RT profile:', e);
  }
};

export const loadCitizens = (): Citizen[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading citizens:', e);
  }
  return defaultCitizens;
};

export const saveCitizens = (citizens: Citizen[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
  } catch (e) {
    console.error('Error saving citizens:', e);
  }
};

export const loadMeetings = (): Meeting[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading meetings:', e);
  }
  return defaultMeetings;
};

export const saveMeetings = (meetings: Meeting[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (e) {
    console.error('Error saving meetings:', e);
  }
};

export const resetAllData = (): { profile: RTProfile; citizens: Citizen[]; meetings: Meeting[] } => {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.CITIZENS);
  localStorage.removeItem(STORAGE_KEYS.MEETINGS);
  return {
    profile: defaultRTProfile,
    citizens: defaultCitizens,
    meetings: defaultMeetings,
  };
};
