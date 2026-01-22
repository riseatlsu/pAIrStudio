// Export level building tools
export { LevelBuilder } from '../levels/LevelBuilder';
export { LevelConfigValidator } from '../levels/LevelSchema';
export { LevelManager } from '../levels/LevelManager';
// export { IsometricNPC } from '../iso/IsoNPC'; // Re-export if needed
export const IsometricNPC = class { constructor() { console.log('NPC Placeholder'); } }; // Placeholder for now
