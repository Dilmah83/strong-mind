import {defaults,migrateState,validateState} from './model.js';
export const KEY='strong-mind-v1'; // Keep the original storage key and origin.
export const BACKUP=KEY+'-last-good';
export class StateRepository {
  constructor(storage) {this.storage=storage;this.blocked=false;this.raw=null;}
  load() {
    try {
      this.raw=this.storage.getItem(KEY);
      if (!this.raw) return {state:defaults(),warning:''};
      const state=migrateState(JSON.parse(this.raw));
      // Preserve original bytes once before migrating. Never overwrite an unreadable primary save.
      if(JSON.parse(this.raw).version!==2&&!this.storage.getItem(KEY+'-before-v2')) {
        try {this.storage.setItem(KEY+'-before-v2',this.raw);}
        catch {this.blocked=true;return {state,warning:'Your records were loaded, but the pre-V2 recovery copy could not be stored. Saving is paused. Export a backup before restoring or freeing storage.'};}
      }
      return {state,warning:''};
    } catch(error) {this.blocked=true;return {state:defaults(),warning:'Saved data could not be loaded safely. Your original data has been kept. Export the recovery file or restore a valid backup in Settings. Saving is paused.'};}
  }
  save(state,{restore=false}={}) {
    if(this.blocked&&!restore)throw Error('Saving is paused to protect unreadable data. Export the recovery file and restore a valid backup.');
    validateState(state);
    const next=JSON.stringify(state),previous=this.storage.getItem(KEY);
    if(!restore&&previous!==this.raw)throw Error('Stored data changed in another window. Reload before saving to avoid overwriting it.');
    if(previous) {
      // Failure is surfaced before touching the primary record (e.g. storage quota).
      this.storage.setItem(BACKUP,previous);
    }
    this.storage.setItem(KEY,next);this.raw=next;this.blocked=false;
  }
  restore(text) {const candidate=migrateState(JSON.parse(text));this.save(candidate,{restore:true});return candidate;}
  previous(){return this.storage.getItem(BACKUP);}
}
